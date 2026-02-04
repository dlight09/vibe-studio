import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateSpotsRemaining(
  capacity: number,
  confirmedBookings: number
): number {
  return Math.max(0, capacity - confirmedBookings)
}

export function getBookingStatus(
  spotsRemaining: number,
  isWaitlisted: boolean
): 'available' | 'full' | 'waitlist' {
  if (spotsRemaining <= 0 && !isWaitlisted) return 'full'
  if (spotsRemaining <= 0 && isWaitlisted) return 'waitlist'
  return 'available'
}

export function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(time)
    }
  }
  return slots
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const totalMins = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMins / 60) % 24
  const newMins = totalMins % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}
