'use client'

import { formatTime, formatDate } from '@/lib/utils'

interface BookingModalProps {
  class: {
    id: string
    startTime: string | Date
    endTime: string | Date
    capacity: number
    spotsRemaining: number
    isFull: boolean
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
  }
  onClose: () => void
  onBook: () => void
}

export default function BookingModal({ class: classItem, onClose, onBook }: BookingModalProps) {
  const startTime = formatTime(classItem.startTime)
  const endTime = formatTime(classItem.endTime)
  const date = formatDate(classItem.startTime)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Book Class</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="class-preview">
            <div className="preview-header">
              <span className="preview-icon">{classItem.classType.icon || '●'}</span>
              <div>
                <h3 className="preview-name">{classItem.classType.name}</h3>
                <p className="preview-meta">
                  {date} • {startTime} - {endTime}
                </p>
              </div>
            </div>

            <div className="preview-details">
              <div className="detail-row">
                <span className="detail-label">Instructor</span>
                <span className="detail-value">{classItem.instructor.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{classItem.classType.durationMinutes} minutes</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Intensity</span>
                <span className="detail-value">
                  {'●'.repeat(classItem.classType.intensity)}
                  {'○'.repeat(5 - classItem.classType.intensity)}
                </span>
              </div>
              {classItem.room && (
                <div className="detail-row">
                  <span className="detail-label">Room</span>
                  <span className="detail-value">{classItem.room}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Availability</span>
                <span className="detail-value">
                  {classItem.isFull
                    ? `Full (${classItem.spotsRemaining} spots)`
                    : `${classItem.spotsRemaining} spots remaining`}
                </span>
              </div>
            </div>

            <p className="preview-description">{classItem.classType.description}</p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onBook} className="btn btn-primary">
            {classItem.isFull ? 'Join Waitlist' : 'Confirm Booking'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: rgb(var(--muted-foreground));
          border-radius: 8px;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: rgb(var(--muted));
        }
        .modal-title {
          font-size: 18px;
          font-weight: 600;
        }
        .class-preview {
          padding: 4px;
        }
        .preview-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
        }
        .preview-icon {
          font-size: 40px;
        }
        .preview-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .preview-meta {
          font-size: 14px;
          color: rgb(var(--muted-foreground));
        }
        .preview-details {
          background: rgb(var(--muted));
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgb(var(--border));
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-size: 14px;
          color: rgb(var(--muted-foreground));
        }
        .detail-value {
          font-size: 14px;
          font-weight: 500;
        }
        .preview-description {
          font-size: 14px;
          color: rgb(var(--muted-foreground));
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}
