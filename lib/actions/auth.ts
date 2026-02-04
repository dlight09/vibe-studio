'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret'
)

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
    .sign(JWT_SECRET)
  
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookie = cookies().get('session')?.value
  if (!cookie) return null

  try {
    const payload = await jose.jwtVerify(cookie, JWT_SECRET)
    return payload.payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function logout() {
  cookies().delete('session')
  revalidatePath('/')
}

export async function login(email: string, password: string) {
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
