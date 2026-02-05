import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { getBookableClasses } from '@/lib/actions/bookings'
import ScheduleClient from './ScheduleClient'
import { prisma } from '@/lib/db'
import { getMemberEntitlements } from '@/lib/actions/membership'

export default async function SchedulePage() {
  const session = await getSession()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 14)

  const classes = await getBookableClasses(today, endDate)
  const entitlements = session ? await getMemberEntitlements(session.id) : null
  const instructors = await prisma.instructor.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const entitlementSummary = !session
    ? { kind: 'loggedOut' as const }
    : entitlements?.activeUnlimited
      ? {
          kind: 'unlimited' as const,
          planName: entitlements.activeUnlimited.plan.name,
          endAt: entitlements.activeUnlimited.endAt.toISOString(),
        }
      : entitlements && entitlements.creditBalance > 0
        ? { kind: 'credits' as const, credits: entitlements.creditBalance }
        : { kind: 'none' as const }

  return (
    <ScheduleClient
      initialClasses={classes}
      userId={session?.id}
      instructors={instructors}
      entitlementSummary={entitlementSummary}
    />
  )
}
