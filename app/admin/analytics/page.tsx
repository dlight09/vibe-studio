import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/auth'
import { getAnalytics } from '@/lib/actions/admin'

export default async function AdminAnalyticsPage() {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const analytics = await getAnalytics(startDate, endDate)

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Studio performance and class insights</p>
        </div>
        <div className="date-range">
          Last 30 days
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
            <span className="stat-label">Average Fill Rate</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{analytics.totalCapacity}</span>
            <span className="stat-label">Total Capacity</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section card">
          <div className="card-header">
            <h2 className="card-title">Performance by Class Type</h2>
          </div>
          <div className="card-body">
            {(analytics.byClassType || []).length === 0 ? (
              <div className="empty">
                <p className="empty-description">No data available</p>
              </div>
            ) : (
              <div className="class-performance">
                {analytics.byClassType
                  ?.sort((a, b) => b.bookings - a.bookings)
                  .map((type) => (
                    <div key={type.name} className="performance-row">
                      <div className="performance-info">
                        <span className="performance-name">{type.name}</span>
                        <span className="performance-meta">
                          {type.classes} classes • {type.capacity} total spots
                        </span>
                      </div>
                      <div className="performance-bar">
                        <div className="bar-container">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${type.capacity > 0 ? (type.bookings / type.capacity) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <div className="bar-stats">
                          <span className="bookings-count">{type.bookings} booked</span>
                          <span className="fill-rate">{type.capacity > 0 ? Math.round((type.bookings / type.capacity) * 100) : 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="analytics-section card">
          <div className="card-header">
            <h2 className="card-title">Bookings by Day</h2>
          </div>
          <div className="card-body">
            {(analytics.byDay || []).length === 0 ? (
              <div className="empty">
                <p className="empty-description">No data available</p>
              </div>
            ) : (
              <div className="day-performance">
                {(analytics.byDay || []).map((day) => (
                  <div key={day.day} className="day-row">
                    <span className="day-name">{day.day}</span>
                    <div className="day-bar-container">
                      <div
                        className="day-bar-fill"
                        style={{
                          width: `${day.classes > 0 ? Math.min(100, (day.bookings / (day.classes * 20)) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="day-stats">{day.bookings} / {day.classes} classes</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="insights-section card">
        <div className="card-header">
          <h2 className="card-title">Quick Insights</h2>
        </div>
        <div className="card-body">
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <span className="insight-value">
                  {(analytics.byClassType || []).length > 0
                    ? (analytics.byClassType || []).sort((a, b) => b.bookings - a.bookings)[0]?.name
                    : 'N/A'}
                </span>
                <span className="insight-label">Most Popular Class</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⏰</div>
              <div className="insight-content">
                <span className="insight-value">
                  {(analytics.byDay || []).length > 0
                    ? (analytics.byDay || []).sort((a, b) => b.bookings - a.bookings)[0]?.day
                    : 'N/A'}
                </span>
                <span className="insight-label">Busiest Day</span>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <span className="insight-value">{analytics.fillRate}%</span>
                <span className="insight-label">Overall Fill Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
