'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/actions/auth'
import { revalidatePath } from 'next/cache'
import { writeAudit } from '@/lib/audit'
import { getStripeClient } from '@/lib/stripe'
import { getRequiredEnv } from '@/lib/env'

async function computeEntitlements(userId: string) {
  const now = new Date()
  const activeUnlimited = await prisma.memberSubscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      startAt: { lte: now },
      endAt: { gte: now },
      plan: { type: 'UNLIMITED' },
    },
    include: { plan: true },
    orderBy: { endAt: 'desc' },
  })

  const credits = await prisma.creditLedgerEntry.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    select: { delta: true },
  })

  const creditBalance = credits.reduce((acc: number, e) => acc + e.delta, 0)
  return { activeUnlimited, creditBalance }
}

export async function listPlans() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) return []

  return prisma.plan.findMany({ orderBy: { name: 'asc' } })
}

export async function createPlan(data: {
  name: string
  type: 'UNLIMITED' | 'CLASS_PACK' | 'DROP_IN'
  priceCents: number
  currency?: string
  durationDays?: number | null
  credits?: number | null
  creditExpiryDays?: number | null
}) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  const plan = await prisma.plan.create({
    data: {
      name: data.name,
      type: data.type,
      priceCents: data.priceCents,
      currency: data.currency || 'USD',
      durationDays: data.durationDays ?? null,
      credits: data.credits ?? null,
      creditExpiryDays: data.creditExpiryDays ?? null,
    },
  })

  await writeAudit({
    action: 'PLAN_CREATE',
    entityType: 'Plan',
    entityId: plan.id,
    metadata: { name: plan.name, type: plan.type, priceCents: plan.priceCents },
  })

  revalidatePath('/admin')
  return { success: true, plan }
}

export async function setPlanActive(planId: string, isActive: boolean) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }

  const existing = await prisma.plan.findUnique({ where: { id: planId } })
  if (!existing) return { error: 'Plan not found' }

  const plan = await prisma.plan.update({
    where: { id: planId },
    data: { isActive },
  })

  await writeAudit({
    action: 'PLAN_UPDATE',
    entityType: 'Plan',
    entityId: plan.id,
    metadata: { name: plan.name, from: existing.isActive, to: isActive },
  })

  revalidatePath('/admin/plans')
  revalidatePath('/admin/members')
  return { success: true, plan }
}

export async function getMemberEntitlements(userId: string) {
  const session = await getSession()
  if (!session) return { activeUnlimited: null, creditBalance: 0 }

  if (session.id !== userId && session.role !== 'STAFF' && session.role !== 'ADMIN') {
    return { activeUnlimited: null, creditBalance: 0 }
  }

  return computeEntitlements(userId)
}

// Internal helper for server-side workflows (waitlist promotions, admin reporting, etc.).
// Do not expose to client components.
export async function getMemberEntitlementsInternal(userId: string) {
  return computeEntitlements(userId)
}

export async function sellPlanAtCounter(data: {
  userId: string
  planId: string
  paymentMethod: 'CASH' | 'COUNTER_CARD' | 'COMP' | 'ADJUSTMENT'
  amountCents?: number
  note?: string
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) return { error: 'Unauthorized' }

  const plan = await prisma.plan.findUnique({ where: { id: data.planId } })
  if (!plan || !plan.isActive) return { error: 'Plan not found' }

  const amountCents = data.amountCents ?? plan.priceCents
  if (amountCents < 0) return { error: 'Invalid amount' }

  const now = new Date()
  const purchase = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        userId: data.userId,
        planId: plan.id,
        status: 'PAID',
        subtotalCents: amountCents,
        totalCents: amountCents,
        currency: plan.currency,
        note: data.note || null,
      },
    })

    await tx.payment.create({
      data: {
        purchaseId: purchase.id,
        method: data.paymentMethod,
        status: 'RECEIVED',
        amountCents,
        note: data.note || null,
      },
    })

    if (plan.type === 'UNLIMITED') {
      const durationDays = plan.durationDays ?? 30
      const endAt = new Date(now)
      endAt.setDate(endAt.getDate() + durationDays)
      await tx.memberSubscription.create({
        data: {
          userId: data.userId,
          planId: plan.id,
          startAt: now,
          endAt,
          status: 'ACTIVE',
          purchaseId: purchase.id,
        },
      })
    } else {
      const credits = plan.credits ?? 1
      const expiresAt = plan.creditExpiryDays
        ? new Date(now.getTime() + plan.creditExpiryDays * 24 * 60 * 60 * 1000)
        : null

      await tx.creditLedgerEntry.create({
        data: {
          userId: data.userId,
          delta: credits,
          reason: 'PURCHASE',
          expiresAt,
          purchaseId: purchase.id,
          note: `Purchase: ${plan.name}`,
        },
      })
    }

    return purchase
  })

  await writeAudit({
    action: 'PURCHASE_CREATE',
    entityType: 'Purchase',
    entityId: purchase.id,
    metadata: { userId: data.userId, planId: plan.id, paymentMethod: data.paymentMethod, amountCents },
  })

  await writeAudit({
    action: 'PAYMENT_RECORD',
    entityType: 'Purchase',
    entityId: purchase.id,
    metadata: { method: data.paymentMethod, amountCents },
  })

  revalidatePath('/admin')
  revalidatePath(`/admin/members/${data.userId}`)
  revalidatePath('/dashboard')
  return { success: true, purchaseId: purchase.id }
}

export async function adjustMemberCredits(data: { userId: string; delta: number; note: string }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' }
  if (!data.note || data.note.trim().length < 3) return { error: 'Reason is required' }
  if (!Number.isFinite(data.delta) || data.delta === 0) return { error: 'Invalid delta' }

  const entry = await prisma.creditLedgerEntry.create({
    data: {
      userId: data.userId,
      delta: data.delta,
      reason: 'MANUAL_ADJUST',
      note: data.note,
    },
  })

  await writeAudit({
    action: 'CREDIT_ADJUST',
    entityType: 'CreditLedgerEntry',
    entityId: entry.id,
    metadata: { userId: data.userId, delta: data.delta, note: data.note },
  })

  revalidatePath(`/admin/members/${data.userId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function createStripeCheckoutForPlan(data: { planId: string }) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const plan = await prisma.plan.findUnique({ where: { id: data.planId } })
  if (!plan || !plan.isActive) return { error: 'Plan not found' }

  const appUrl = getRequiredEnv('APP_URL')
  const stripe = getStripeClient()

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${appUrl}/dashboard?payment=success`,
    cancel_url: `${appUrl}/dashboard?payment=cancelled`,
    line_items: [
      {
        price_data: {
          currency: plan.currency.toLowerCase(),
          unit_amount: plan.priceCents,
          product_data: {
            name: plan.name,
            description: `Vibe Studio ${plan.type.toLowerCase()} plan`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: session.id,
      planId: plan.id,
    },
  })

  if (!checkout.url) {
    return { error: 'Failed to create checkout session' }
  }

  return { success: true, checkoutUrl: checkout.url }
}

export async function handleStripeCheckoutCompleted(params: {
  checkoutSessionId: string
  paymentIntentId: string | null
  userId: string
  planId: string
}) {
  const existing = await prisma.purchase.findFirst({
    where: {
      OR: [
        { stripeCheckoutSessionId: params.checkoutSessionId },
        ...(params.paymentIntentId ? [{ stripePaymentIntentId: params.paymentIntentId }] : []),
      ],
    },
    select: { id: true },
  })

  if (existing) {
    return { success: true, purchaseId: existing.id, duplicate: true }
  }

  const plan = await prisma.plan.findUnique({ where: { id: params.planId } })
  if (!plan || !plan.isActive) return { error: 'Plan not found' }

  const now = new Date()

  const purchase = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        userId: params.userId,
        planId: plan.id,
        status: 'PAID',
        subtotalCents: plan.priceCents,
        totalCents: plan.priceCents,
        currency: plan.currency,
        stripeCheckoutSessionId: params.checkoutSessionId,
        stripePaymentIntentId: params.paymentIntentId,
        note: 'Paid via Stripe Checkout',
      },
    })

    await tx.payment.create({
      data: {
        purchaseId: purchase.id,
        method: 'STRIPE_CARD',
        status: 'RECEIVED',
        amountCents: plan.priceCents,
        note: 'Stripe checkout payment',
      },
    })

    if (plan.type === 'UNLIMITED') {
      const durationDays = plan.durationDays ?? 30
      const endAt = new Date(now)
      endAt.setDate(endAt.getDate() + durationDays)

      await tx.memberSubscription.create({
        data: {
          userId: params.userId,
          planId: plan.id,
          startAt: now,
          endAt,
          status: 'ACTIVE',
          purchaseId: purchase.id,
        },
      })
    } else {
      const credits = plan.credits ?? 1
      const expiresAt = plan.creditExpiryDays
        ? new Date(now.getTime() + plan.creditExpiryDays * 24 * 60 * 60 * 1000)
        : null

      await tx.creditLedgerEntry.create({
        data: {
          userId: params.userId,
          delta: credits,
          reason: 'PURCHASE',
          expiresAt,
          purchaseId: purchase.id,
          note: `Stripe purchase: ${plan.name}`,
        },
      })
    }

    return purchase
  })

  await writeAudit({
    action: 'PURCHASE_CREATE',
    entityType: 'Purchase',
    entityId: purchase.id,
    metadata: {
      userId: params.userId,
      planId: plan.id,
      method: 'STRIPE_CARD',
      amountCents: plan.priceCents,
      checkoutSessionId: params.checkoutSessionId,
    },
  })

  await writeAudit({
    action: 'PAYMENT_RECORD',
    entityType: 'Purchase',
    entityId: purchase.id,
    metadata: {
      method: 'STRIPE_CARD',
      amountCents: plan.priceCents,
      paymentIntentId: params.paymentIntentId,
    },
  })

  revalidatePath('/dashboard')
  return { success: true, purchaseId: purchase.id }
}
