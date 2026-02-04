'use server'

import { prisma } from '@/lib/db'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function getBookableClasses(
  startDate: Date,
  endDate: Date,
  filters?: {
    category?: string
    instructorId?: string
    intensity?: number
  }
) {
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

  if (user.membershipExpiresAt && user.membershipExpiresAt < new Date()) {
    return { error: 'Your membership has expired. Please renew to book classes.' }
  }

  const classItem = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      bookings: { where: { status: 'CONFIRMED' } },
      waitlistEntries: { orderBy: { position: 'asc' } },
    },
  })
  if (!classItem) return { error: 'Class not found' }

  if (classItem.isCancelled) return { error: 'This class has been cancelled' }

  const existingBooking = await prisma.booking.findUnique({
    where: {
      userId_classId: {
        userId: session.id,
        classId,
      },
    },
  })
  if (existingBooking) {
    if (existingBooking.status === 'CONFIRMED') {
      return { error: 'You are already booked for this class' }
    }
  }

  const settings = await prisma.studioSettings.findFirst()
  const cancelWindow = settings?.cancellationWindowHours || 12
  const classStartTime = new Date(classItem.startTime)
  const now = new Date()
  const hoursUntilClass =
    (classStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  const spotsRemaining = classItem.capacity - classItem.bookings.length

  if (spotsRemaining > 0) {
    await prisma.booking.create({
      data: {
        userId: session.id,
        classId,
        status: 'CONFIRMED',
      },
    })
    revalidatePath('/schedule')
    revalidatePath('/dashboard')
    return { success: true, message: 'Class booked successfully!' }
  } else {
    const lastEntry = classItem.waitlistEntries[classItem.waitlistEntries.length - 1]
    const newPosition = lastEntry ? lastEntry.position + 1 : 1

    await prisma.waitlistEntry.create({
      data: {
        userId: session.id,
        classId,
        position: newPosition,
      },
    })
    revalidatePath('/schedule')
    revalidatePath('/dashboard')
    return {
      success: true,
      message: `Added to waitlist (position ${newPosition})`,
      isWaitlist: true,
    }
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
  const hoursUntilClass =
    (classStartTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilClass < cancelWindow && session.role !== 'ADMIN') {
    return {
      error: `Cannot cancel within ${cancelWindow} hours of class. Please contact staff.`,
    }
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
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
  reindexWaitlist(entry.classId)
  revalidatePath('/schedule')
  revalidatePath('/dashboard')
  return { success: true }
}

async function promoteFromWaitlist(classId: string) {
  const classItem = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      bookings: { where: { status: 'CONFIRMED' } },
      waitlistEntries: {
        orderBy: { position: 'asc' },
        include: { user: true },
      },
    },
  })
  if (!classItem) return

  const spotsAvailable = classItem.capacity - classItem.bookings.length
  if (spotsAvailable <= 0) return

  for (let i = 0; i < Math.min(spotsAvailable, classItem.waitlistEntries.length); i++) {
    const entry = classItem.waitlistEntries[i]
    await prisma.booking.create({
      data: {
        userId: entry.userId,
        classId,
        status: 'CONFIRMED',
      },
    })
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: { promotedAt: new Date() },
    })
  }

  await reindexWaitlist(classId)
}

async function reindexWaitlist(classId: string) {
  const entries = await prisma.waitlistEntry.findMany({
    where: { classId, promotedAt: null },
    orderBy: { createdAt: 'asc' },
  })

  for (let i = 0; i < entries.length; i++) {
    await prisma.waitlistEntry.update({
      where: { id: entries[i].id },
      data: { position: i + 1 },
    })
  }
}
