'use server'

import { prisma } from '@/lib/db'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'
import { writeAudit } from '@/lib/audit'
import type { Prisma } from '@prisma/client'
import {
  canMemberCancelBooking,
  hasBookingEntitlement,
  hoursUntil,
} from '@/lib/domain/booking'

const SERIALIZABLE_RETRY_LIMIT = 3

function isRetryableTransactionError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const code = (error as { code?: string }).code
  return code === 'P2034'
}

async function withSerializableRetries<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>) {
  let attempt = 0
  while (attempt < SERIALIZABLE_RETRY_LIMIT) {
    try {
      return await prisma.$transaction(operation, { isolationLevel: 'Serializable' })
    } catch (error) {
      attempt += 1
      if (!isRetryableTransactionError(error) || attempt >= SERIALIZABLE_RETRY_LIMIT) {
        throw error
      }
    }
  }

  throw new Error('Failed to complete transaction after retries')
}

async function getEntitlementsInTx(tx: Prisma.TransactionClient, userId: string) {
  const now = new Date()
  const activeUnlimited = await tx.memberSubscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      startAt: { lte: now },
      endAt: { gte: now },
      plan: { type: 'UNLIMITED' },
    },
    select: { id: true },
    orderBy: { endAt: 'desc' },
  })

  const creditAggregate = await tx.creditLedgerEntry.aggregate({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    _sum: { delta: true },
  })

  return {
    hasUnlimited: Boolean(activeUnlimited),
    creditBalance: creditAggregate._sum.delta ?? 0,
  }
}

export async function getBookableClasses(
  startDate: Date,
  endDate: Date,
  filters?: {
    category?: string
    instructorId?: string
    intensity?: number
  }
) {
  try {
    const classes = await prisma.class.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        isCancelled: false,
        classType: {
          ...(filters?.category && { category: filters.category }),
          ...(filters?.intensity && { intensity: filters.intensity }),
          isActive: true,
        },
        ...(filters?.instructorId && { instructorId: filters.instructorId }),
      },
      include: {
        classType: true,
        instructor: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          select: { id: true, userId: true, status: true },
        },
        waitlistEntries: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    return classes.map((c) => ({
      ...c,
      instructor: {
        ...c.instructor,
        specialties: Array.isArray((c.instructor as any).specialties)
          ? ((c.instructor as any).specialties as unknown as string[])
          : JSON.parse((c.instructor as any).specialties || '[]'),
      },
      spotsRemaining: c.capacity - c.bookings.length,
      isFull: c.bookings.length >= c.capacity,
      waitlistCount: c.waitlistEntries.length,
    }))
  } catch {
    return []
  }
}

export async function getUserBookings() {
  const session = await getSession()
  if (!session) return []

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.id,
      status: { in: ['CONFIRMED', 'WAITLISTED'] },
      class: {
        startTime: { gte: new Date() },
      },
    },
    include: {
      class: {
        include: {
          classType: true,
          instructor: true,
        },
      },
    },
    orderBy: { class: { startTime: 'asc' } },
  })

  return bookings
}

export async function getUserWaitlist() {
  const session = await getSession()
  if (!session) return []

  const waitlist = await prisma.waitlistEntry.findMany({
    where: {
      userId: session.id,
      class: {
        startTime: { gte: new Date() },
      },
    },
    include: {
      class: {
        include: {
          classType: true,
          instructor: true,
          bookings: {
            where: { status: 'CONFIRMED' },
          },
        },
      },
    },
    orderBy: { class: { startTime: 'asc' } },
  })

  return waitlist.map((w) => ({
    ...w,
    spotsAvailable: w.class.capacity - w.class.bookings.length,
  }))
}

export async function bookClass(classId: string) {
  const session = await getSession()
  if (!session) return { error: 'Please log in to book classes' }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  })
  if (!user) return { error: 'User not found' }

  const transactionResult = await withSerializableRetries(async (tx) => {
    const classItem = await tx.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        capacity: true,
        isCancelled: true,
      },
    })

    if (!classItem) {
      return { error: 'Class not found' as const }
    }

    if (classItem.isCancelled) {
      return { error: 'This class has been cancelled' as const }
    }

    const existingBooking = await tx.booking.findUnique({
      where: {
        userId_classId: {
          userId: session.id,
          classId,
        },
      },
    })

    if (existingBooking?.status === 'CONFIRMED') {
      return { error: 'You are already booked for this class' as const }
    }

    const overlapping = await tx.booking.findFirst({
      where: {
        userId: session.id,
        status: 'CONFIRMED',
        class: {
          isCancelled: false,
          startTime: { lt: classItem.endTime },
          endTime: { gt: classItem.startTime },
        },
      },
      select: { id: true },
    })

    if (overlapping) {
      return { error: 'You have another booking that overlaps this time' as const }
    }

    const entitlements = await getEntitlementsInTx(tx, session.id)
    const hasUnlimited = entitlements.hasUnlimited
    if (!hasBookingEntitlement({ hasUnlimited, creditBalance: entitlements.creditBalance })) {
      return { error: 'No active membership or credits available.' as const }
    }

    const confirmedCount = await tx.booking.count({
      where: { classId, status: 'CONFIRMED' },
    })

    if (confirmedCount < classItem.capacity) {
      const booking = existingBooking
        ? await tx.booking.update({
            where: { id: existingBooking.id },
            data: {
              status: 'CONFIRMED',
              cancelledAt: null,
              bookedAt: new Date(),
            },
          })
        : await tx.booking.create({
            data: {
              userId: session.id,
              classId,
              status: 'CONFIRMED',
            },
          })

      if (!hasUnlimited) {
        await tx.creditLedgerEntry.create({
          data: {
            userId: session.id,
            delta: -1,
            reason: 'BOOKING_CONSUME',
            bookingId: booking.id,
            note: `Booked class ${classId}`,
          },
        })
      }

      await tx.waitlistEntry.deleteMany({
        where: { userId: session.id, classId, promotedAt: null },
      })

      return {
        success: true as const,
        mode: 'BOOKED' as const,
        bookingId: booking.id,
        creditConsumed: !hasUnlimited,
      }
    }

    const existingWaitlist = await tx.waitlistEntry.findUnique({
      where: {
        userId_classId: {
          userId: session.id,
          classId,
        },
      },
    })

    if (existingWaitlist && !existingWaitlist.promotedAt) {
      return { error: `Already on waitlist (position ${existingWaitlist.position})` as const }
    }

    const waitlistCount = await tx.waitlistEntry.count({
      where: { classId, promotedAt: null },
    })
    const newPosition = waitlistCount + 1

    const entry = existingWaitlist
      ? await tx.waitlistEntry.update({
          where: { id: existingWaitlist.id },
          data: { position: newPosition, promotedAt: null, notifiedAt: null },
        })
      : await tx.waitlistEntry.create({
          data: {
            userId: session.id,
            classId,
            position: newPosition,
          },
        })

    return {
      success: true as const,
      mode: 'WAITLIST' as const,
      entryId: entry.id,
      position: entry.position,
    }
  })

  if ('error' in transactionResult) {
    return { error: transactionResult.error }
  }

  if (transactionResult.mode === 'BOOKED') {
    await writeAudit({
      action: 'BOOKING_CREATE',
      entityType: 'Booking',
      entityId: transactionResult.bookingId,
      metadata: { classId, creditConsumed: transactionResult.creditConsumed },
    })

    revalidatePath('/schedule')
    revalidatePath('/dashboard')
    return { success: true, message: 'Class booked successfully!' }
  }

  await writeAudit({
    action: 'WAITLIST_JOIN',
    entityType: 'WaitlistEntry',
    entityId: transactionResult.entryId,
    metadata: { classId, position: transactionResult.position },
  })

  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  return {
    success: true,
    message: `Added to waitlist (position ${transactionResult.position})`,
    isWaitlist: true,
  }
}

export async function cancelBooking(bookingId: string) {
  const session = await getSession()
  if (!session) return { error: 'Please log in' }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { class: true },
  })
  if (!booking) return { error: 'Booking not found' }

  if (booking.userId !== session.id && session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const settings = await prisma.studioSettings.findFirst()
  const cancelWindow = settings?.cancellationWindowHours || 12
  const classStartTime = new Date(booking.class.startTime)
  const now = new Date()
  const hoursUntilClass = hoursUntil(classStartTime, now)

  if (!canMemberCancelBooking({
    hoursUntilClass,
    cancellationWindowHours: cancelWindow,
    role: session.role,
  })) {
    return {
      error: `Cannot cancel within ${cancelWindow} hours of class. Please contact staff.`,
    }
  }

  await withSerializableRetries(async (tx) => {
    const freshBooking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { class: true },
    })

    if (!freshBooking || freshBooking.status === 'CANCELLED') {
      return
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    if (hoursUntilClass >= cancelWindow) {
      const consumed = await tx.creditLedgerEntry.findFirst({
        where: {
          bookingId,
          reason: 'BOOKING_CONSUME',
        },
        orderBy: { createdAt: 'asc' },
      })

      if (consumed) {
        await tx.creditLedgerEntry.create({
          data: {
            userId: freshBooking.userId,
            delta: 1,
            reason: 'CANCEL_REFUND',
            bookingId,
            note: 'Refunded credit after cancellation',
          },
        })
      }
    }
  })

  await writeAudit({
    action: 'BOOKING_CANCEL',
    entityType: 'Booking',
    entityId: bookingId,
    metadata: { classId: booking.classId },
  })

  await promoteFromWaitlist(booking.classId)
  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  return { success: true, message: 'Booking cancelled' }
}

export async function cancelWaitlistEntry(entryId: string) {
  const session = await getSession()
  if (!session) return { error: 'Please log in' }

  const entry = await prisma.waitlistEntry.findUnique({
    where: { id: entryId },
  })
  if (!entry) return { error: 'Waitlist entry not found' }

  if (entry.userId !== session.id && session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  await prisma.waitlistEntry.delete({ where: { id: entryId } })
  await reindexWaitlist(entry.classId)
  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  return { success: true }
}

async function promoteFromWaitlist(classId: string) {
  const audits = await withSerializableRetries(async (tx) => {
    const auditEvents: Array<{
      entryId: string
      bookingId?: string
      userId: string
      creditConsumed?: boolean
      skipped?: string
    }> = []

    const classItem = await tx.class.findUnique({
      where: { id: classId },
      select: { id: true, capacity: true },
    })
    if (!classItem) return auditEvents

    while (true) {
      const confirmedCount = await tx.booking.count({
        where: { classId, status: 'CONFIRMED' },
      })

      if (confirmedCount >= classItem.capacity) {
        break
      }

      const entry = await tx.waitlistEntry.findFirst({
        where: { classId, promotedAt: null },
        orderBy: { position: 'asc' },
      })
      if (!entry) break

      const entitlements = await getEntitlementsInTx(tx, entry.userId)
      const hasUnlimited = entitlements.hasUnlimited

      if (!hasBookingEntitlement({ hasUnlimited, creditBalance: entitlements.creditBalance })) {
        await tx.waitlistEntry.delete({ where: { id: entry.id } })
        auditEvents.push({
          entryId: entry.id,
          userId: entry.userId,
          skipped: 'ineligible',
        })
        continue
      }

      const existingBooking = await tx.booking.findUnique({
        where: {
          userId_classId: {
            userId: entry.userId,
            classId,
          },
        },
      })

      const booking = existingBooking
        ? await tx.booking.update({
            where: { id: existingBooking.id },
            data: {
              status: 'CONFIRMED',
              cancelledAt: null,
              bookedAt: new Date(),
            },
          })
        : await tx.booking.create({
            data: {
              userId: entry.userId,
              classId,
              status: 'CONFIRMED',
            },
          })

      if (!hasUnlimited) {
        await tx.creditLedgerEntry.create({
          data: {
            userId: entry.userId,
            delta: -1,
            reason: 'BOOKING_CONSUME',
            bookingId: booking.id,
            note: `Promoted from waitlist for class ${classId}`,
          },
        })
      }

      await tx.waitlistEntry.update({
        where: { id: entry.id },
        data: { promotedAt: new Date() },
      })

      auditEvents.push({
        entryId: entry.id,
        bookingId: booking.id,
        userId: entry.userId,
        creditConsumed: !hasUnlimited,
      })
    }

    await reindexWaitlistInTx(tx, classId)
    return auditEvents
  })

  for (const event of audits) {
    await writeAudit({
      action: 'WAITLIST_PROMOTE',
      entityType: 'WaitlistEntry',
      entityId: event.entryId,
      metadata: {
        classId,
        bookingId: event.bookingId,
        userId: event.userId,
        creditConsumed: event.creditConsumed,
        skipped: event.skipped,
      },
    })
  }
}

async function reindexWaitlist(classId: string) {
  await withSerializableRetries(async (tx) => {
    await reindexWaitlistInTx(tx, classId)
  })
}

async function reindexWaitlistInTx(tx: Prisma.TransactionClient, classId: string) {
  const entries = await tx.waitlistEntry.findMany({
    where: { classId, promotedAt: null },
    orderBy: { createdAt: 'asc' },
  })

  for (let i = 0; i < entries.length; i++) {
    await tx.waitlistEntry.update({
      where: { id: entries[i].id },
      data: { position: i + 1 },
    })
  }
}
