import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'
import { getUserBookings, getUserWaitlist } from '@/lib/actions/bookings'
import { prisma } from '@/lib/db'
import { formatDate, formatTime } from '@/lib/utils'
import { getMemberEntitlements } from '@/lib/actions/membership'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const [bookings, waitlist, entitlements, legacy] = await Promise.all([
    getUserBookings(),
    getUserWaitlist(),
    getMemberEntitlements(session.id),
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        membershipType: true,
        membershipExpiresAt: true,
      },
    }),
  ])

  const now = new Date()
  const activeUnlimited = entitlements.activeUnlimited
  const creditBalance = entitlements.creditBalance
  const legacyActive = !!(legacy?.membershipExpiresAt && legacy.membershipExpiresAt > now)

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.class.startTime) > new Date()
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="welcome">
          <h1 className="welcome-title">Welcome back, {session.name.split(' ')[0]}</h1>
          <p className="welcome-subtitle">Manage your bookings and schedule</p>
        </div>
        <Link href="/schedule" className="btn btn-primary">
          Book a Class
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="membership-card card">
          <div className="card-header">
            <h2 className="card-title">Membership</h2>
          </div>
          <div className="card-body">
            <div className="membership-info">
              <div className="membership-type">
                <span className="type-label">Current Plan</span>
                <span className="type-value">
                  {activeUnlimited
                    ? activeUnlimited.plan.name
                    : legacyActive
                      ? legacy?.membershipType?.replace('_', ' ') || 'Drop-in'
                      : creditBalance > 0
                        ? `Credits (${creditBalance})`
                        : 'None'}
                </span>
              </div>
              <div className="membership-expiry">
                <span className="expiry-label">
                  {activeUnlimited
                    ? 'Ends'
                    : legacyActive
                      ? 'Expires'
                      : creditBalance > 0
                        ? 'Credits'
                        : 'Status'}
                </span>
                <span className="expiry-value">
                  {activeUnlimited
                    ? new Date(activeUnlimited.endAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : legacyActive
                      ? new Date(legacy!.membershipExpiresAt!).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : creditBalance > 0
                        ? `${creditBalance} available`
                        : 'No active plan'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-card card">
          <div className="stat">
            <span className="stat-value">{upcomingBookings.length}</span>
            <span className="stat-label">Upcoming Classes</span>
          </div>
          <div className="stat">
            <span className="stat-value">{waitlist.length}</span>
            <span className="stat-label">On Waitlist</span>
          </div>
          <div className="stat">
            <span className="stat-value">{bookings.filter(b => b.status === 'CONFIRMED').length}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Upcoming Classes</h2>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="empty card">
            <div className="empty-icon">📅</div>
            <h3 className="empty-title">No upcoming classes</h3>
            <p className="empty-description">
              You don't have any bookings yet. Browse the schedule to book your first class.
            </p>
            <Link href="/schedule" className="btn btn-primary">
              View Schedule
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="booking-item card">
                <div className="booking-time">
                  <span className="booking-date">{formatDate(booking.class.startTime)}</span>
                  <span className="booking-hour">{formatTime(booking.class.startTime)}</span>
                </div>
                <div className="booking-details">
                  <div className="booking-info">
                    <span className="booking-icon">{booking.class.classType.icon || '●'}</span>
                    <div>
                      <h3 className="booking-name">{booking.class.classType.name}</h3>
                      <p className="booking-meta">
                        {booking.class.classType.durationMinutes} min • {booking.class.instructor.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="booking-status">
                  <span className="badge badge-success">Confirmed</span>
                </div>
                <form action={`/api/bookings/${booking.id}`} method="POST">
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {waitlist.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Waitlist</h2>
          </div>
          <div className="waitlist-list">
            {waitlist.map((entry) => (
              <div key={entry.id} className="waitlist-item card">
                <div className="booking-time">
                  <span className="booking-date">{formatDate(entry.class.startTime)}</span>
                  <span className="booking-hour">{formatTime(entry.class.startTime)}</span>
                </div>
                <div className="booking-details">
                  <div className="booking-info">
                    <span className="booking-icon">{entry.class.classType.icon || '●'}</span>
                    <div>
                      <h3 className="booking-name">{entry.class.classType.name}</h3>
                      <p className="booking-meta">
                        {entry.class.instructor.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="booking-status">
                  <span className="badge badge-warning">Position #{entry.position}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
