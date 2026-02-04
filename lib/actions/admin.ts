'use server'

import { prisma } from '@/lib/db'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function createClass(data: {
  classTypeId: string
  instructorId: string
  startTime: string
  durationMinutes: number
  capacity: number
  room?: string
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const startTime = new Date(data.startTime)
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + data.durationMinutes)

  const classItem = await prisma.class.create({
    data: {
      classTypeId: data.classTypeId,
      instructorId: data.instructorId,
      startTime,
      endTime,
      capacity: data.capacity,
      room: data.room,
    },
  })

  revalidatePath('/admin/classes')
  revalidatePath('/schedule')
  return { success: true, class: classItem }
}

export async function updateClass(
  classId: string,
  data: {
    classTypeId?: string
    instructorId?: string
    startTime?: string
    durationMinutes?: number
    capacity?: number
    room?: string
    isCancelled?: boolean
    cancelReason?: string
  }
) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const updateData: Record<string, unknown> = {}

  if (data.classTypeId) updateData.classTypeId = data.classTypeId
  if (data.instructorId) updateData.instructorId = data.instructorId
  if (data.capacity) updateData.capacity = data.capacity
  if (data.room !== undefined) updateData.room = data.room
  if (data.isCancelled !== undefined) {
    updateData.isCancelled = data.isCancelled
    updateData.cancelReason = data.cancelReason || null
  }

  if (data.startTime) {
    const startTime = new Date(data.startTime)
    updateData.startTime = startTime
    if (data.durationMinutes) {
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + data.durationMinutes)
      updateData.endTime = endTime
    }
  }

  await prisma.class.update({
    where: { id: classId },
    data: updateData,
  })

  revalidatePath('/admin/classes')
  revalidatePath('/schedule')
  return { success: true }
}

export async function deleteClass(classId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  await prisma.class.delete({ where: { id: classId } })
  revalidatePath('/admin/classes')
  revalidatePath('/schedule')
  return { success: true }
}

export async function createClassType(data: {
  name: string
  description?: string
  category: string
  intensity: number
  durationMinutes: number
  color: string
  icon?: string
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const classType = await prisma.classType.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      intensity: data.intensity,
      durationMinutes: data.durationMinutes,
      color: data.color,
      icon: data.icon,
    },
  })

  revalidatePath('/admin/classes')
  return { success: true, classType }
}

export async function createInstructor(data: {
  name: string
  bio?: string
  specialties: string[]
  avatarUrl?: string
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const instructor = await prisma.instructor.create({
    data: {
      name: data.name,
      bio: data.bio,
      specialties: JSON.stringify(data.specialties),
      avatarUrl: data.avatarUrl,
    },
  })

  return { success: true, instructor }
}

export async function getAnalytics(startDate: Date, endDate: Date) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const classes = await prisma.class.findMany({
    where: {
      startTime: { gte: startDate, lte: endDate },
    },
    include: {
      classType: true,
      bookings: { where: { status: 'CONFIRMED' } },
      attendances: true,
    },
  })

  const totalClasses = classes.length
  const totalBookings = classes.reduce((acc, c) => acc + c.bookings.length, 0)
  const totalCapacity = classes.reduce((acc, c) => acc + c.capacity, 0)
  const fillRate = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0

  const byClassType = classes.reduce((acc, c) => {
    const type = c.classType.name
    if (!acc[type]) {
      acc[type] = { name: type, bookings: 0, capacity: 0, classes: 0 }
    }
    acc[type].bookings += c.bookings.length
    acc[type].capacity += c.capacity
    acc[type].classes += 1
    return acc
  }, {} as Record<string, { name: string; bookings: number; capacity: number; classes: number }>)

  const byDay = classes.reduce((acc, c) => {
    const day = new Date(c.startTime).toLocaleDateString('en-US', {
      weekday: 'short',
    })
    if (!acc[day]) acc[day] = { day, bookings: 0, classes: 0 }
    acc[day].bookings += c.bookings.length
    acc[day].classes += 1
    return acc
  }, {} as Record<string, { day: string; bookings: number; classes: number }>)

  return {
    totalClasses,
    totalBookings,
    totalCapacity,
    fillRate: Math.round(fillRate * 10) / 10,
    byClassType: Object.values(byClassType),
    byDay: Object.values(byDay),
  }
}

export async function getAdminClasses(startDate: Date, endDate: Date) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return []
  }

  return prisma.class.findMany({
    where: {
      startTime: { gte: startDate, lte: endDate },
    },
    include: {
      classType: true,
      instructor: true,
      bookings: {
        include: { user: true },
        where: { status: 'CONFIRMED' },
      },
      waitlistEntries: {
        include: { user: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { startTime: 'asc' },
  })
}

export async function promoteFromWaitlistAdmin(classId: string, userId: string) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const entry = await prisma.waitlistEntry.findFirst({
    where: { classId, userId },
  })
  if (!entry) return { error: 'Waitlist entry not found' }

  await prisma.booking.create({
    data: {
      userId,
      classId,
      status: 'CONFIRMED',
    },
  })

  await prisma.waitlistEntry.delete({ where: { id: entry.id } })
  await reindexWaitlistAdmin(classId)

  revalidatePath('/admin/classes')
  revalidatePath('/schedule')
  return { success: true }
}

async function reindexWaitlistAdmin(classId: string) {
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

export async function overrideCapacity(classId: string, userId: string) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const classItem = await prisma.class.findUnique({
    where: { id: classId },
    include: { bookings: { where: { status: 'CONFIRMED' } } },
  })
  if (!classItem) return { error: 'Class not found' }

  await prisma.booking.create({
    data: {
      userId,
      classId,
      status: 'CONFIRMED',
    },
  })

  revalidatePath('/admin/classes')
  revalidatePath('/schedule')
  return { success: true }
}

export async function markAttendance(classId: string, userId: string, attended: boolean) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  if (attended) {
    await prisma.attendance.create({
      data: { userId, classId },
    })
  } else {
    await prisma.attendance.deleteMany({
      where: { userId, classId },
    })
  }

  revalidatePath('/admin/classes')
  return { success: true }
}
