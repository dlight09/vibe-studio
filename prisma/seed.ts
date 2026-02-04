import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const memberPassword = await bcrypt.hash('member123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@vibestudio.com' },
    update: {},
    create: {
      email: 'admin@vibestudio.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      membershipType: 'UNLIMITED',
      membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@vibestudio.com' },
    update: {},
    create: {
      email: 'staff@vibestudio.com',
      name: 'Staff Member',
      passwordHash: adminPassword,
      role: 'STAFF',
      membershipType: 'UNLIMITED',
      membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  })

  const members = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        name: 'Sarah Chen',
        passwordHash: memberPassword,
        role: 'MEMBER',
        membershipType: 'UNLIMITED',
        membershipExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike@example.com' },
      update: {},
      create: {
        email: 'mike@example.com',
        name: 'Mike Johnson',
        passwordHash: memberPassword,
        role: 'MEMBER',
        membershipType: 'CLASS_PACK_10',
        membershipExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.user.upsert({
      where: { email: 'emma@example.com' },
      update: {},
      create: {
        email: 'emma@example.com',
        name: 'Emma Davis',
        passwordHash: memberPassword,
        role: 'MEMBER',
        membershipType: 'UNLIMITED',
        membershipExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  const instructors = await Promise.all([
    prisma.instructor.create({
      data: {
        name: 'Isabella Martinez',
        bio: 'Former professional dancer with 15 years of teaching experience.',
        avatarUrl: null,
        specialties: JSON.stringify(['Pilates', 'Core Strength', 'Flexibility']),
      },
    }),
    prisma.instructor.create({
      data: {
        name: 'David Kim',
        bio: 'Yoga instructor specializing in vinyasa and restorative practices.',
        avatarUrl: null,
        specialties: JSON.stringify(['Vinyasa Yoga', 'Meditation', 'Breathwork']),
      },
    }),
    prisma.instructor.create({
      data: {
        name: 'Marcus Williams',
        bio: 'Strength and conditioning specialist with a background in athletics.',
        avatarUrl: null,
        specialties: JSON.stringify(['HIIT', 'Strength Training', 'Conditioning']),
      },
    }),
    prisma.instructor.create({
      data: {
        name: 'Olivia Thompson',
        bio: 'Barre instructor passionate about building long, lean muscles.',
        avatarUrl: null,
        specialties: JSON.stringify(['Barre', 'Ballet Fitness', 'Core Work']),
      },
    }),
  ])

  const classTypes = await Promise.all([
    prisma.classType.create({
      data: {
        name: 'Morning Flow Yoga',
        description: 'Start your day with an energizing vinyasa practice.',
        category: 'Yoga',
        intensity: 3,
        durationMinutes: 60,
        color: '#10b981',
        icon: '🧘',
      },
    }),
    prisma.classType.create({
      data: {
        name: 'Reformer Pilates',
        description: 'Full-body conditioning on the Pilates reformer.',
        category: 'Pilates',
        intensity: 4,
        durationMinutes: 50,
        color: '#8b5cf6',
        icon: '💪',
      },
    }),
    prisma.classType.create({
      data: {
        name: 'Barre Burn',
        description: 'High-intensity barre workout for sculpted muscles.',
        category: 'Barre',
        intensity: 4,
        durationMinutes: 45,
        color: '#ec4899',
        icon: '🩰',
      },
    }),
    prisma.classType.create({
      data: {
        name: 'Strength & Conditioning',
        description: 'Build strength and endurance with functional training.',
        category: 'Strength',
        intensity: 5,
        durationMinutes: 60,
        color: '#f59e0b',
        icon: '🏋️',
      },
    }),
    prisma.classType.create({
      data: {
        name: 'Restorative Yoga',
        description: 'Gentle, relaxing practice to restore and reset.',
        category: 'Yoga',
        intensity: 1,
        durationMinutes: 75,
        color: '#06b6d4',
        icon: '🌸',
      },
    }),
    prisma.classType.create({
      data: {
        name: 'Core & Abs',
        description: 'Focused core work for a strong center.',
        category: 'Core',
        intensity: 3,
        durationMinutes: 30,
        color: '#ef4444',
        icon: '🎯',
      },
    }),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const schedule = [
    { dayOffset: 0, hour: 6, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 0, hour: 7, classTypeIndex: 2, instructorIndex: 3, duration: 45 },
    { dayOffset: 0, hour: 9, classTypeIndex: 1, instructorIndex: 0, duration: 50 },
    { dayOffset: 0, hour: 12, classTypeIndex: 5, instructorIndex: 2, duration: 30 },
    { dayOffset: 0, hour: 17, classTypeIndex: 3, instructorIndex: 2, duration: 60 },
    { dayOffset: 0, hour: 18, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 1, hour: 6, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 1, hour: 7, classTypeIndex: 2, instructorIndex: 3, duration: 45 },
    { dayOffset: 1, hour: 9, classTypeIndex: 1, instructorIndex: 0, duration: 50 },
    { dayOffset: 1, hour: 12, classTypeIndex: 5, instructorIndex: 2, duration: 30 },
    { dayOffset: 1, hour: 17, classTypeIndex: 3, instructorIndex: 2, duration: 60 },
    { dayOffset: 1, hour: 18, classTypeIndex: 4, instructorIndex: 1, duration: 75 },
    { dayOffset: 2, hour: 6, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 2, hour: 7, classTypeIndex: 2, instructorIndex: 3, duration: 45 },
    { dayOffset: 2, hour: 9, classTypeIndex: 1, instructorIndex: 0, duration: 50 },
    { dayOffset: 2, hour: 12, classTypeIndex: 5, instructorIndex: 2, duration: 30 },
    { dayOffset: 2, hour: 17, classTypeIndex: 3, instructorIndex: 2, duration: 60 },
    { dayOffset: 2, hour: 18, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 3, hour: 6, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 3, hour: 7, classTypeIndex: 2, instructorIndex: 3, duration: 45 },
    { dayOffset: 3, hour: 9, classTypeIndex: 1, instructorIndex: 0, duration: 50 },
    { dayOffset: 3, hour: 12, classTypeIndex: 5, instructorIndex: 2, duration: 30 },
    { dayOffset: 3, hour: 17, classTypeIndex: 3, instructorIndex: 2, duration: 60 },
    { dayOffset: 3, hour: 18, classTypeIndex: 4, instructorIndex: 1, duration: 75 },
    { dayOffset: 4, hour: 6, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 4, hour: 7, classTypeIndex: 2, instructorIndex: 3, duration: 45 },
    { dayOffset: 4, hour: 9, classTypeIndex: 1, instructorIndex: 0, duration: 50 },
    { dayOffset: 4, hour: 12, classTypeIndex: 5, instructorIndex: 2, duration: 30 },
    { dayOffset: 4, hour: 17, classTypeIndex: 3, instructorIndex: 2, duration: 60 },
    { dayOffset: 4, hour: 18, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 5, hour: 8, classTypeIndex: 4, instructorIndex: 1, duration: 75 },
    { dayOffset: 5, hour: 10, classTypeIndex: 1, instructorIndex: 0, duration: 50 },
    { dayOffset: 5, hour: 11, classTypeIndex: 2, instructorIndex: 3, duration: 45 },
    { dayOffset: 6, hour: 9, classTypeIndex: 0, instructorIndex: 1, duration: 60 },
    { dayOffset: 6, hour: 11, classTypeIndex: 1, instructorIndex: 0, duration: 50 },
  ]

  for (const slot of schedule) {
    const classDate = new Date(today)
    classDate.setDate(classDate.getDate() + slot.dayOffset)
    classDate.setHours(slot.hour, 0, 0, 0)

    const endTime = new Date(classDate)
    endTime.setMinutes(endTime.getMinutes() + slot.duration)

    await prisma.class.create({
      data: {
        classTypeId: classTypes[slot.classTypeIndex].id,
        instructorId: instructors[slot.instructorIndex].id,
        startTime: classDate,
        endTime: endTime,
        capacity: slot.classTypeIndex === 1 ? 12 : 20,
        room: slot.classTypeIndex === 1 ? 'Studio A' : 'Main Studio',
      },
    })
  }

  const allClasses = await prisma.class.findMany({
    where: {
      startTime: { gte: today },
    },
    take: 20,
  })

  for (let i = 0; i < Math.min(5, allClasses.length); i++) {
    const class_ = allClasses[i]
    const member = members[i % members.length]

    await prisma.booking.create({
      data: {
        userId: member.id,
        classId: class_.id,
        status: 'CONFIRMED',
      },
    })
  }

  if (allClasses.length > 0) {
    await prisma.waitlistEntry.create({
      data: {
        userId: members[0].id,
        classId: allClasses[0].id,
        position: 1,
      },
    })
  }

  await prisma.studioSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Vibe Studio',
      bookingWindowDays: 14,
      cancellationWindowHours: 12,
      minBookingBalance: 1,
      defaultCapacity: 20,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('Demo accounts:')
  console.log('  Admin: admin@vibestudio.com / admin123')
  console.log('  Staff: staff@vibestudio.com / admin123')
  console.log('  Member: sarah@example.com / member123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
