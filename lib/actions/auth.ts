'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { getSessionSecret, isProduction } from '@/lib/env'
import { checkRateLimit } from '@/lib/rate-limit'
import { logWarn } from '@/lib/observability'

const SESSION_COOKIE_NAME = 'session'

function jwtSecret() {
  return new TextEncoder().encode(getSessionSecret())
}

function getClientIp() {
  const h = headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return h.get('x-real-ip') || 'unknown'
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
}

export async function createSession(user: SessionUser) {
  const token = await new jose.SignJWT({ 'sub': user.id, ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(jwtSecret())
  
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!cookie) return null

  try {
    const payload = await jose.jwtVerify(cookie, jwtSecret())
    return payload.payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME)
  revalidatePath('/')
}

export async function login(email: string, password: string) {
  const ip = getClientIp()
  const rateLimit = checkRateLimit(`login:${ip}:${email.toLowerCase()}`, {
    windowMs: 10 * 60 * 1000,
    max: 10,
  })

  if (!rateLimit.allowed) {
    logWarn('auth.login.rate_limited', { email, ip, retryAfterSeconds: rateLimit.retryAfterSeconds })
    return {
      error: `Too many login attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
    }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'Invalid credentials' }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) return { error: 'Invalid credentials' }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  return { success: true }
}

export async function register(data: {
  email: string
  name: string
  password: string
}) {
  if (data.password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) return { error: 'Email already registered' }

  const passwordHash = await bcrypt.hash(data.password, 10)
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
      role: 'MEMBER',
      membershipType: 'DROP_IN',
    },
  })

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  return { success: true }
}
