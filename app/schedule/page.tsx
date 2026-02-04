import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { getBookableClasses } from '@/lib/actions/bookings'
import ScheduleClient from './ScheduleClient'
import { prisma } from '@/lib/db'

export default async function SchedulePage() {
  const session = await getSession()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 14)

  const classes = await getBookableClasses(today, endDate)
  const instructors = await prisma.instructor.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return <ScheduleClient initialClasses={classes} userId={session?.id} instructors={instructors} />
}
