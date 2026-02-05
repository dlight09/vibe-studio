'use client'

import { formatTime } from '@/lib/utils'

interface ClassCardProps {
  class: {
    id: string
    startTime: string | Date
    endTime: string | Date
    capacity: number
    spotsRemaining: number
    isFull: boolean
    waitlistCount: number
    room: string | null
    classType: {
      id: string
      name: string
      description: string | null
      category: string
      intensity: number
      durationMinutes: number
      color: string
      icon: string | null
    }
    instructor: {
      id: string
      name: string
      bio: string | null
      avatarUrl: string | null
    specialties: string[]
  }
  bookings: Array<{ id: string; userId: string; status: string }>
  waitlistEntries: Array<{ userId: string; position: number }>
  userBookingStatus?: string
  userWaitlistPosition?: number
  }
  onBook: () => void
  onCancel: () => void
  userId?: string
  pending?: boolean
}

export default function ClassCard({ class: classItem, onBook, onCancel, userId, pending }: ClassCardProps) {
  const userBooking = classItem.bookings.find((b) => b.userId === userId && b.status === 'CONFIRMED')
  const userWaitlist = classItem.waitlistEntries.find((w) => w.userId === userId)

  const startTime = formatTime(classItem.startTime)
  const endTime = formatTime(classItem.endTime)
  const intensityBars = Array.from({ length: 5 }, (_, i) => i < classItem.classType.intensity)

  return (
    <div className="class-card">
      <div className="class-time">
        <div className="time-main">{startTime}</div>
        <div className="time-sub">{endTime}</div>
      </div>

      <div className="class-content">
        <div className="class-header">
          <div className="class-info">
            <span className="class-icon">{classItem.classType.icon || '●'}</span>
            <div>
              <h3 className="class-name">{classItem.classType.name}</h3>
              <p className="class-meta">
                {classItem.classType.durationMinutes} min • {classItem.classType.category}
              </p>
            </div>
          </div>
          <div className="intensity">
            {intensityBars.map((active, i) => (
              <span key={i} className={`intensity-bar ${active ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <p className="class-description">{classItem.classType.description}</p>

        <div className="class-footer">
          <div className="instructor">
            <div className="avatar avatar-sm">
              {classItem.instructor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="instructor-name">{classItem.instructor.name}</span>
          </div>

          <div className="spots">
            {userBooking ? (
              <span className="badge badge-success">Booked</span>
            ) : userWaitlist ? (
              <span className="badge badge-warning">
                Waitlist #{userWaitlist.position}
              </span>
            ) : classItem.isFull ? (
              <span className="badge badge-error">
                Full ({classItem.waitlistCount} waiting)
              </span>
            ) : classItem.spotsRemaining <= 3 ? (
              <span className="badge badge-warning">
                {classItem.spotsRemaining} spots left
              </span>
            ) : (
              <span className="badge">{classItem.spotsRemaining} spots</span>
            )}
          </div>
        </div>

        {userBooking ? (
          <button onClick={onCancel} className="btn btn-secondary btn-sm cancel-btn">
            {pending ? <span className="loading-spinner" /> : 'Cancel Booking'}
          </button>
        ) : (
          <button
            onClick={onBook}
            className={`btn btn-sm book-btn ${classItem.isFull ? 'btn-secondary' : 'btn-primary'}`}
            disabled={!!userWaitlist || !!pending}
          >
            {pending ? (
              <span className="loading-spinner" />
            ) : userWaitlist ? (
              `Waitlist #${userWaitlist.position}`
            ) : classItem.isFull ? (
              'Join Waitlist'
            ) : (
              'Book'
            )}
          </button>
        )}
      </div>

      <style jsx>{`
        .class-card {
          display: flex;
          gap: 24px;
          padding: 24px;
          background: rgb(var(--card));
          border: 1px solid rgb(var(--border));
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .class-card:hover {
          border-color: rgb(var(--ring));
          box-shadow: var(--shadow);
        }
        .class-time {
          flex-shrink: 0;
          width: 80px;
          text-align: center;
          padding-top: 4px;
        }
        .time-main {
          font-size: 24px;
          font-weight: 600;
          line-height: 1;
        }
        .time-sub {
          font-size: 14px;
          color: rgb(var(--muted-foreground));
          margin-top: 4px;
        }
        .class-content {
          flex: 1;
          min-width: 0;
        }
        .class-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .class-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .class-icon {
          font-size: 24px;
        }
        .class-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .class-meta {
          font-size: 13px;
          color: rgb(var(--muted-foreground));
        }
        .intensity {
          display: flex;
          gap: 3px;
        }
        .intensity-bar {
          width: 6px;
          height: 18px;
          background: rgb(var(--muted));
          border-radius: 3px;
        }
        .intensity-bar.active {
          background: var(--color, rgb(var(--foreground)));
        }
        .class-description {
          font-size: 14px;
          color: rgb(var(--muted-foreground));
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .class-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .instructor {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .avatar-sm {
          width: 28px;
          height: 28px;
          font-size: 11px;
        }
        .instructor-name {
          font-size: 14px;
          font-weight: 500;
        }
        .spots {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .book-btn {
          width: 100%;
        }
        .cancel-btn {
          width: 100%;
          margin-top: 12px;
          border-color: rgb(var(--error));
          color: rgb(var(--error));
        }
        .cancel-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }
        @media (max-width: 640px) {
          .class-card {
            flex-direction: column;
            gap: 16px;
          }
          .class-time {
            width: auto;
            text-align: left;
            display: flex;
            gap: 8px;
            align-items: baseline;
          }
        }
      `}</style>
    </div>
  )
}
