import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'
import { getAnalytics } from '@/lib/actions/admin'
import { prisma } from '@/lib/db'
import { formatDate, formatTime } from '@/lib/utils'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const [analytics, recentBookings, upcomingClasses] = await Promise.all([
    getAnalytics(startDate, endDate),
    prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        class: { startTime: { gte: new Date() } },
      },
      include: {
        user: { select: { name: true, email: true } },
        class: {
          include: {
            classType: { select: { name: true } },
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { bookedAt: 'desc' },
      take: 10,
    }),
    prisma.class.findMany({
      where: {
        startTime: { gte: new Date() },
        isCancelled: false,
      },
      include: {
        classType: true,
        instructor: true,
        bookings: { where: { status: 'CONFIRMED' } },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    }),
  ])

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage classes, view analytics, and monitor bookings</p>
        </div>
        <div className="admin-actions">
          <Link href="/admin/classes" className="btn btn-secondary">
            Manage Classes
          </Link>
          <Link href="/admin/instructors" className="btn btn-secondary">
            Instructors
          </Link>
          <Link href="/admin/members" className="btn btn-secondary">
            Members
          </Link>
          <Link href="/admin/plans" className="btn btn-secondary">
            Plans
          </Link>
          <Link href="/admin/audit" className="btn btn-secondary">
            Audit
          </Link>
          <Link href="/admin/analytics" className="btn btn-primary">
            Analytics
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{analytics.totalClasses}</span>
            <span className="stat-label">Total Classes</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{analytics.totalBookings}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{analytics.fillRate}%</span>
            <span className="stat-label">Fill Rate</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{analytics.totalCapacity}</span>
            <span className="stat-label">Total Capacity</span>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-section card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Classes</h2>
          </div>
          <div className="card-body">
            {upcomingClasses.length === 0 ? (
              <div className="empty">
                <p className="empty-description">No upcoming classes</p>
              </div>
            ) : (
              <div className="class-list">
                {upcomingClasses.map((classItem) => (
                  <div key={classItem.id} className="class-row">
                    <div className="class-info">
                      <span className="class-date">{formatDate(classItem.startTime)}</span>
                      <span className="class-time">{formatTime(classItem.startTime)}</span>
                      <span className="class-divider">•</span>
                      <span className="class-name">{classItem.classType.name}</span>
                      <span className="class-instructor">with {classItem.instructor.name}</span>
                    </div>
                    <div className="class-stats">
                      <span className={classItem.bookings.length >= classItem.capacity ? 'text-warning' : ''}>
                        {classItem.bookings.length}/{classItem.capacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-section card">
          <div className="card-header">
            <h2 className="card-title">Recent Bookings</h2>
          </div>
          <div className="card-body">
            {recentBookings.length === 0 ? (
              <div className="empty">
                <p className="empty-description">No recent bookings</p>
              </div>
            ) : (
              <div className="booking-list">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="booking-row">
                    <div className="booking-user">
                      <div className="avatar avatar-sm">
                        {booking.user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="booking-details">
                        <span className="user-name">{booking.user.name}</span>
                        <span className="class-type">{booking.class.classType.name}</span>
                      </div>
                    </div>
                    <div className="booking-time">
                      {formatDate(booking.class.startTime)} {formatTime(booking.class.startTime)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-section card">
        <div className="card-header">
          <h2 className="card-title">Popular Class Types</h2>
        </div>
        <div className="card-body">
          <div className="popular-list">
            {(analytics.byClassType || []).map((type) => (
              <div key={type.name} className="popular-row">
                <div className="popular-info">
                  <span className="popular-name">{type.name}</span>
                  <span className="popular-meta">{type.classes} classes</span>
                </div>
                <div className="popular-stats">
                  <div className="fill-bar">
                    <div
                      className="fill-progress"
                      style={{
                        width: type.capacity > 0 ? `${(type.bookings / type.capacity) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <span className="fill-text">
                    {type.capacity > 0 ? Math.round((type.bookings / type.capacity) * 100) : 0}% filled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
