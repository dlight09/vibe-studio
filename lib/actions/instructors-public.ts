'use server'

import { prisma } from '@/lib/db'
import { getSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function getInstructorsPublic() {
  try {
    const instructors = await prisma.instructor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        specialties: true,
      },
    })

    return instructors.map((i) => ({
      ...i,
      specialties: Array.isArray((i as any).specialties)
        ? ((i as any).specialties as unknown as string[])
        : JSON.parse((i as any).specialties || '[]'),
    }))
  } catch (e) {
    return []
  }
}

export async function getInstructorPublic(id: string) {
  const instructor = await prisma.instructor.findFirst({
    where: { id, isActive: true },
    include: {
      classes: {
        where: {
          startTime: { gte: new Date() },
          isCancelled: false,
        },
        include: {
          classType: true,
          instructor: {
            select: { name: true },
          },
          bookings: {
            where: { status: 'CONFIRMED' },
          },
        },
        orderBy: { startTime: 'asc' },
        take: 20,
      },
    },
  }).catch(() => null)

  if (!instructor) return null

  const specialties = Array.isArray(instructor.specialties)
    ? (instructor.specialties as unknown as string[])
    : JSON.parse(instructor.specialties || '[]')

  const upcomingClasses = (instructor.classes || []).filter(
    (c) => new Date(c.startTime) >= new Date()
  )

  const byClassType = upcomingClasses.reduce((acc: Record<string, { name: string; count: number }>, c) => {
    const type = c.classType.name
    if (!acc[type]) acc[type] = { name: type, count: 0 }
    acc[type].count += 1
    return acc
  }, {})

  return {
    ...instructor,
    upcomingClasses,
    byClassType: Object.values(byClassType),
    specialties,
  }
}
