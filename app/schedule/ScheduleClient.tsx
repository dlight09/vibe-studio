'use client'

import { useEffect, useState, useCallback } from 'react'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import ClassCard from '@/components/calendar/ClassCard'
import BookingModal from '@/components/booking/BookingModal'
import FilterBar from '@/components/calendar/FilterBar'
import { useToast } from '@/components/ui/ToastProvider'

interface Class {
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

interface ScheduleClientProps {
  initialClasses: Class[]
  userId?: string
  instructors: Array<{ id: string; name: string }>
}

export default function ScheduleClient({ initialClasses, userId, instructors }: ScheduleClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [classes, setClasses] = useState<Class[]>(initialClasses)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    intensity: 0,
    instructorId: '',
  })
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [pending, setPending] = useState<Record<string, 'book' | 'cancel' | null>>({})

  useEffect(() => {
    setClasses(initialClasses)
  }, [initialClasses])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filteredClasses = classes.filter((c) => {
    const classDate = typeof c.startTime === 'string' ? parseISO(c.startTime) : c.startTime
    if (!isSameDay(classDate, selectedDate)) return false
    if (filters.category && c.classType.category !== filters.category) return false
    if (filters.instructorId && c.instructor.id !== filters.instructorId) return false
    if (filters.intensity && c.classType.intensity !== filters.intensity) return false
    return true
  })

  const navigateWeek = useCallback((direction: number) => {
    setWeekStart((prev) => addDays(prev, direction * 7))
    setSelectedDate((prev) => addDays(prev, direction * 7))
  }, [])

  const handleBook = useCallback(async (classId: string) => {
    setPending((p) => ({ ...p, [classId]: 'book' }))
    const formData = new FormData()
    formData.append('classId', classId)

    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      const data = await response.json().catch(() => null)
      toast({
        title: data?.isWaitlist ? 'Added to waitlist' : 'Booked',
        description: data?.message,
        variant: 'success',
      })
      router.refresh()
    } else {
      const data = await response.json()
      toast({ title: 'Booking failed', description: data.error || 'Failed to book class', variant: 'error' })
    }
    setPending((p) => ({ ...p, [classId]: null }))
  }, [router, toast])

  const handleCancel = useCallback(async (bookingId: string) => {
    setPending((p) => ({ ...p, [bookingId]: 'cancel' }))
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      const data = await response.json().catch(() => null)
      toast({ title: 'Cancelled', description: data?.message, variant: 'success' })
      router.refresh()
    } else {
      const data = await response.json()
      toast({ title: 'Cancellation failed', description: data.error || 'Failed to cancel booking', variant: 'error' })
    }
    setPending((p) => ({ ...p, [bookingId]: null }))
  }, [router, toast])

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1 className="schedule-title">Class Schedule</h1>
        <div className="schedule-subtitle">
          Book your next session
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        viewMode="week"
        onViewModeChange={() => {}}
        instructors={instructors}
      />

      <div className="week-nav">
        <button onClick={() => navigateWeek(-1)} className="btn btn-ghost btn-sm">
          ← Previous
        </button>
        <span className="week-label">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={() => navigateWeek(1)} className="btn btn-ghost btn-sm">
          Next →
        </button>
      </div>

      <div className="day-tabs">
        {weekDays.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`day-tab ${isSameDay(day, selectedDate) ? 'active' : ''}`}
          >
            <span className="day-name">{format(day, 'EEE')}</span>
            <span className="day-date">{format(day, 'd')}</span>
          </button>
        ))}
      </div>

      <div className="schedule-content">
        {filteredClasses.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <h3 className="empty-title">No classes scheduled</h3>
            <p className="empty-description">
              There are no classes matching your filters for {format(selectedDate, 'EEEE, MMMM d')}.
            </p>
          </div>
        ) : (
          <div className="class-grid">
            {filteredClasses.map((classItem) => (
              <ClassCard
                key={classItem.id}
                class={classItem}
                onBook={() => handleBook(classItem.id)}
                onCancel={() => {
                  const booking = classItem.bookings.find((b) => b.userId === userId)
                  if (booking?.id) {
                    handleCancel(booking.id)
                  }
                }}
                userId={userId}
                pending={
                  pending[classItem.id] === 'book' ||
                  pending[classItem.bookings.find((b) => b.userId === userId)?.id || ''] === 'cancel'
                }
              />
            ))}
          </div>
        )}
      </div>

      {selectedClass && (
        <BookingModal
          class={selectedClass}
          onClose={() => setSelectedClass(null)}
          onBook={() => handleBook(selectedClass.id)}
        />
      )}
    </div>
  )
}
