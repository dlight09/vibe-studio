import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'
import {
  getInstructor,
  getInstructorStats,
  addInstructorAvailability,
  deleteInstructorAvailability,
  addInstructorTimeOff,
  deleteInstructorTimeOff,
} from '@/lib/actions/instructors'
import { formatDate, formatTime } from '@/lib/utils'

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  const { id } = await params
  const [instructor, stats] = await Promise.all([
    getInstructor(id),
    getInstructorStats(id, 30),
  ])

  if (!instructor) {
    redirect('/admin/instructors')
  }

  const specialties = Array.isArray(instructor.specialties)
    ? instructor.specialties
    : JSON.parse(instructor.specialties || '[]')

  const availability = (instructor as any).availability ?? []
  const timeOff = (instructor as any).timeOff ?? []
  const classes = (instructor as any).classes ?? []

  return (
    <div className="instructor-detail-page">
      <div className="page-header">
        <Link href="/admin/instructors" className="back-link">
          ← Back to Instructors
        </Link>
        <div className="header-content">
          <div className="instructor-profile">
            <div className="instructor-avatar large">
              {instructor.avatarUrl ? (
                <img src={instructor.avatarUrl} alt={instructor.name} />
              ) : (
                <span>{instructor.name.split(' ').map(n => n[0]).join('')}</span>
              )}
            </div>
            <div className="instructor-info">
              <h1 className="instructor-name">{instructor.name}</h1>
              {instructor.bio && <p className="instructor-bio">{instructor.bio}</p>}
              <div className="specialties-list">
                {specialties.map((specialty: string) => (
                  <span key={specialty} className="specialty-badge">{specialty}</span>
                ))}
              </div>
            </div>
          </div>
          <form action={async () => {
            'use server'
            redirect(`/admin/instructors/${id}/edit`)
          }}>
            <button type="submit" className="btn btn-secondary">Edit Instructor</button>
          </form>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{stats?.totalClasses || 0}</span>
            <span className="stat-label">Classes (30 days)</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{stats?.totalBookings || 0}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{stats?.fillRate || 0}%</span>
            <span className="stat-label">Fill Rate</span>
          </div>
        </div>
        <div className="stat-card card">
          <div className="card-body">
            <span className="stat-value">{stats?.totalAttendances || 0}</span>
            <span className="stat-label">Attendances</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="upcoming-section card">
          <div className="card-header">
            <h2 className="card-title">Upcoming Classes</h2>
          </div>
          <div className="card-body">
            {classes.length === 0 ? (
              <div className="empty">
                <p className="empty-description">No upcoming classes scheduled</p>
              </div>
            ) : (
              <div className="classes-list">
                {classes.map((classItem: any) => (
                  <div key={classItem.id} className="class-item">
                    <div className="class-time">
                      <span className="class-date">{formatDate(classItem.startTime)}</span>
                      <span className="class-hour">{formatTime(classItem.startTime)}</span>
                    </div>
                    <div className="class-details">
                      <span className="class-name">{classItem.classType.name}</span>
                      <span className="class-meta">
                        {classItem.classType.durationMinutes} min • {classItem.bookings.length}/{classItem.capacity} booked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="performance-section card">
          <div className="card-header">
            <h2 className="card-title">Performance by Class Type</h2>
          </div>
          <div className="card-body">
            {stats?.byClassType && stats.byClassType.length > 0 ? (
              <div className="performance-list">
                {stats.byClassType.map((type) => (
                  <div key={type.name} className="performance-row">
                    <div className="performance-info">
                      <span className="performance-name">{type.name}</span>
                      <span className="performance-meta">{type.count} classes</span>
                    </div>
                    <div className="performance-bar">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.min(100, (type.bookings / (type.count * 20)) * 100)}%` }}
                      />
                    </div>
                    <span className="performance-stats">{type.bookings} bookings</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                <p className="empty-description">No performance data yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="schedule-section card">
          <div className="card-header">
            <h2 className="card-title">Schedule by Day</h2>
          </div>
          <div className="card-body">
            {stats?.byDay && stats.byDay.length > 0 ? (
              <div className="day-list">
                {stats.byDay.map((day) => (
                  <div key={day.day} className="day-row">
                    <span className="day-name">{day.day}</span>
                    <div className="day-bar">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.min(100, (day.bookings / (day.count * 20)) * 100)}%` }}
                      />
                    </div>
                    <span className="day-stats">{day.count} classes</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                <p className="empty-description">No schedule data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Availability</h2>
          </div>
          <div className="card-body">
            <form action={async (formData: FormData) => {
              'use server'
              const dayOfWeek = Number(formData.get('dayOfWeek'))
              const startTime = String(formData.get('startTime') || '')
              const endTime = String(formData.get('endTime') || '')
              await addInstructorAvailability({
                instructorId: id,
                dayOfWeek,
                startTime,
                endTime,
              })
            }} className="form-grid">
              <div className="form-group">
                <label className="label" htmlFor="dayOfWeek">Day</label>
                <select id="dayOfWeek" name="dayOfWeek" className="input" required>
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="startTime">Start</label>
                <input className="input" type="time" id="startTime" name="startTime" required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="endTime">End</label>
                <input className="input" type="time" id="endTime" name="endTime" required />
              </div>
              <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-sm">Add</button>
              </div>
            </form>

            {availability.length === 0 ? (
              <p className="text-muted" style={{ marginTop: '12px' }}>No availability rules.</p>
            ) : (
              <div className="table" style={{ marginTop: '12px' }}>
                {availability.map((rule: any) => (
                  <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgb(var(--border))' }}>
                    <span>{dayLabel(rule.dayOfWeek)} • {rule.startTime} - {rule.endTime}</span>
                    <form action={async () => {
                      'use server'
                      await deleteInstructorAvailability(rule.id)
                    }}>
                      <button type="submit" className="btn btn-ghost btn-sm text-error">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Time Off</h2>
          </div>
          <div className="card-body">
            <form action={async (formData: FormData) => {
              'use server'
              const startAtRaw = formData.get('startAt') as string
              const endAtRaw = formData.get('endAt') as string
              const reason = (formData.get('reason') as string) || ''
              if (!startAtRaw || !endAtRaw) return
              await addInstructorTimeOff({
                instructorId: id,
                startAt: new Date(startAtRaw),
                endAt: new Date(endAtRaw),
                reason,
              })
            }} className="form-grid">
              <div className="form-group">
                <label className="label" htmlFor="startAt">Start</label>
                <input className="input" type="datetime-local" id="startAt" name="startAt" required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="endAt">End</label>
                <input className="input" type="datetime-local" id="endAt" name="endAt" required />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="reason">Reason</label>
                <input className="input" type="text" id="reason" name="reason" placeholder="Optional" />
              </div>
              <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-sm">Add</button>
              </div>
            </form>

            {timeOff.length === 0 ? (
              <p className="text-muted" style={{ marginTop: '12px' }}>No time off scheduled.</p>
            ) : (
              <div className="table" style={{ marginTop: '12px' }}>
                {timeOff.map((entry: any) => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgb(var(--border))' }}>
                    <span>{formatDate(entry.startAt)} {formatTime(entry.startAt)} → {formatTime(entry.endAt)} {entry.reason ? `• ${entry.reason}` : ''}</span>
                    <form action={async () => {
                      'use server'
                      await deleteInstructorTimeOff(entry.id)
                    }}>
                      <button type="submit" className="btn btn-ghost btn-sm text-error">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function dayLabel(day: number) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] || ''
}
