'use server'

import { prisma } from '@/lib/db'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'
import { addMinutes, isBefore, isAfter, isEqual } from 'date-fns'
import { writeAudit } from '@/lib/audit'

export async function getInstructors() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return []
  }

  try {
    return await prisma.instructor.findMany({
      orderBy: { name: 'asc' },
      include: {
        classes: {
          where: {
            startTime: { gte: new Date() },
          },
          take: 5,
          orderBy: { startTime: 'asc' },
        },
        _count: {
          select: {
            classes: {
              where: {
                startTime: { gte: new Date() },
              },
            },
          },
        },
      },
    })
  } catch {
    return []
  }
}

export async function getInstructor(id: string) {
  return prisma.instructor.findUnique({
    where: { id },
    include: {
      classes: {
        where: {
          startTime: { gte: new Date() },
          isCancelled: false,
        },
        include: {
          classType: true,
          bookings: {
            where: { status: 'CONFIRMED' },
          },
        },
        orderBy: { startTime: 'asc' },
      },
      availability: true,
      timeOff: true,
    },
  })
}

export async function createInstructor(data: {
  name: string
  bio?: string
  specialties: string[]
  avatarUrl?: string
  email?: string
  phone?: string
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

  await writeAudit({
    action: 'INSTRUCTOR_CREATE',
    entityType: 'Instructor',
    entityId: instructor.id,
    metadata: { name: instructor.name },
  })

  revalidatePath('/admin/instructors')
  return { success: true, instructor }
}

export async function updateInstructor(
  id: string,
  data: {
    name?: string
    bio?: string
    specialties?: string[]
    avatarUrl?: string
    isActive?: boolean
  }
) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const updateData: Record<string, unknown> = {}
  if (data.name) updateData.name = data.name
  if (data.bio !== undefined) updateData.bio = data.bio
  if (data.specialties) updateData.specialties = JSON.stringify(data.specialties)
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  await prisma.instructor.update({
    where: { id },
    data: updateData,
  })

  await writeAudit({
    action: 'INSTRUCTOR_UPDATE',
    entityType: 'Instructor',
    entityId: id,
    metadata: { fields: Object.keys(updateData) },
  })

  revalidatePath('/admin/instructors')
  revalidatePath(`/admin/instructors/${id}`)
  return { success: true }
}

export async function deleteInstructor(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const upcomingClasses = await prisma.class.count({
    where: {
      instructorId: id,
      startTime: { gte: new Date() },
      isCancelled: false,
    },
  })

  if (upcomingClasses > 0) {
    return { error: 'Cannot delete instructor with upcoming classes. Cancel or reassign classes first.' }
  }

  await prisma.instructor.delete({ where: { id } })

  await writeAudit({
    action: 'INSTRUCTOR_DELETE',
    entityType: 'Instructor',
    entityId: id,
  })
  revalidatePath('/admin/instructors')
  return { success: true }
}

export async function getInstructorStats(id: string, days: number = 30) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return null
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const classes = await prisma.class.findMany({
    where: {
      instructorId: id,
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
  const totalAttendances = classes.reduce((acc, c) => acc + c.attendances.length, 0)
  const totalCapacity = classes.reduce((acc, c) => acc + c.capacity, 0)
  const fillRate = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0

  const byClassType = classes.reduce((acc, c) => {
    const type = c.classType.name
    if (!acc[type]) {
      acc[type] = { name: type, count: 0, bookings: 0 }
    }
    acc[type].count += 1
    acc[type].bookings += c.bookings.length
    return acc
  }, {} as Record<string, { name: string; count: number; bookings: number }>)

  const byDay = classes.reduce((acc, c) => {
    const day = new Date(c.startTime).toLocaleDateString('en-US', { weekday: 'short' })
    if (!acc[day]) acc[day] = { day, count: 0, bookings: 0 }
    acc[day].count += 1
    acc[day].bookings += c.bookings.length
    return acc
  }, {} as Record<string, { day: string; count: number; bookings: number }>)

  return {
    totalClasses,
    totalBookings,
    totalAttendances,
    fillRate: Math.round(fillRate * 10) / 10,
    byClassType: Object.values(byClassType),
    byDay: Object.values(byDay),
  }
}

export async function getInstructorPlanning(instructorId: string) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { availability: [], timeOff: [] }
  }

  const [availability, timeOff] = await Promise.all([
    prisma.instructorAvailabilityRule.findMany({
      where: { instructorId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.instructorTimeOff.findMany({
      where: { instructorId, endAt: { gte: new Date() } },
      orderBy: { startAt: 'asc' },
    }),
  ])

  return { availability, timeOff }
}

export async function addInstructorAvailability(data: {
  instructorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  effectiveFrom?: Date | null
  effectiveTo?: Date | null
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  if (!data.startTime || !data.endTime) return { error: 'Start and end time required' }
  if (data.dayOfWeek < 0 || data.dayOfWeek > 6) return { error: 'dayOfWeek must be 0-6' }

  const rule = await prisma.instructorAvailabilityRule.create({
    data: {
      instructorId: data.instructorId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      effectiveFrom: data.effectiveFrom || null,
      effectiveTo: data.effectiveTo || null,
    },
  })

  await writeAudit({
    action: 'INSTRUCTOR_AVAILABILITY_ADD',
    entityType: 'InstructorAvailabilityRule',
    entityId: rule.id,
    metadata: {
      instructorId: data.instructorId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
    },
  })

  revalidatePath(`/admin/instructors/${data.instructorId}`)
  return { success: true }
}

export async function deleteInstructorAvailability(id: string) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const rule = await prisma.instructorAvailabilityRule.findUnique({ where: { id } })
  if (!rule) return { error: 'Not found' }

  await prisma.instructorAvailabilityRule.delete({ where: { id } })

  await writeAudit({
    action: 'INSTRUCTOR_AVAILABILITY_DELETE',
    entityType: 'InstructorAvailabilityRule',
    entityId: id,
    metadata: { instructorId: rule.instructorId },
  })
  revalidatePath(`/admin/instructors/${rule.instructorId}`)
  return { success: true }
}

export async function addInstructorTimeOff(data: {
  instructorId: string
  startAt: Date
  endAt: Date
  reason?: string
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  if (isAfter(data.startAt, data.endAt) || isEqual(data.startAt, data.endAt)) {
    return { error: 'End time must be after start time' }
  }

  const entry = await prisma.instructorTimeOff.create({
    data: {
      instructorId: data.instructorId,
      startAt: data.startAt,
      endAt: data.endAt,
      reason: data.reason || null,
    },
  })

  await writeAudit({
    action: 'INSTRUCTOR_TIME_OFF_ADD',
    entityType: 'InstructorTimeOff',
    entityId: entry.id,
    metadata: {
      instructorId: data.instructorId,
      startAt: data.startAt.toISOString(),
      endAt: data.endAt.toISOString(),
      reason: data.reason || null,
    },
  })

  revalidatePath(`/admin/instructors/${data.instructorId}`)
  return { success: true }
}

export async function deleteInstructorTimeOff(id: string) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    return { error: 'Unauthorized' }
  }

  const timeOff = await prisma.instructorTimeOff.findUnique({ where: { id } })
  if (!timeOff) return { error: 'Not found' }

  await prisma.instructorTimeOff.delete({ where: { id } })

  await writeAudit({
    action: 'INSTRUCTOR_TIME_OFF_DELETE',
    entityType: 'InstructorTimeOff',
    entityId: id,
    metadata: { instructorId: timeOff.instructorId },
  })
  revalidatePath(`/admin/instructors/${timeOff.instructorId}`)
  return { success: true }
}

export async function checkInstructorConflicts(params: {
  instructorId: string
  startTime: Date
  endTime: Date
  classId?: string
  bufferMinutes?: number
}) {
  const bufferMinutes = params.bufferMinutes ?? 0
  const windowStart = addMinutes(params.startTime, -bufferMinutes)
  const windowEnd = addMinutes(params.endTime, bufferMinutes)

  // Time-off conflicts
  const timeOff = await prisma.instructorTimeOff.findFirst({
    where: {
      instructorId: params.instructorId,
      NOT: [
        {
          OR: [
            { endAt: { lte: windowStart } },
            { startAt: { gte: windowEnd } },
          ],
        },
      ],
    },
  })
  if (timeOff) {
    return { error: 'Instructor is unavailable (time off)' }
  }

  // Class conflicts
  const overlappingClass = await prisma.class.findFirst({
    where: {
      instructorId: params.instructorId,
      id: params.classId ? { not: params.classId } : undefined,
      isCancelled: false,
      startTime: { lt: windowEnd },
      endTime: { gt: windowStart },
    },
  })
  if (overlappingClass) {
    return { error: 'Instructor already has a class during this time' }
  }

  // Availability (if rules exist, require at least one rule that contains the time)
  const availabilityRules = await prisma.instructorAvailabilityRule.findMany({
    where: { instructorId: params.instructorId },
  })

  if (availabilityRules.length > 0) {
    const day = params.startTime.getDay()
    const hits = availabilityRules.filter((rule) => {
      if (rule.dayOfWeek !== day) return false
      if (rule.effectiveFrom && isBefore(params.startTime, rule.effectiveFrom)) return false
      if (rule.effectiveTo && isAfter(params.startTime, rule.effectiveTo)) return false
      return isWithinTimeRange(rule.startTime, rule.endTime, params.startTime, params.endTime)
    })
    if (hits.length === 0) {
      return { error: 'Instructor is outside their availability' }
    }
  }

  return { success: true }
}

function isWithinTimeRange(start: string, end: string, from: Date, to: Date) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)

  const day = new Date(from)
  const rangeStart = new Date(day)
  rangeStart.setHours(sh, sm, 0, 0)
  const rangeEnd = new Date(day)
  rangeEnd.setHours(eh, em, 0, 0)

  return from >= rangeStart && to <= rangeEnd
}
