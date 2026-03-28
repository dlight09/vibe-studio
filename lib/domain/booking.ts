export function hasBookingEntitlement(input: {
  hasUnlimited: boolean
  creditBalance: number
}) {
  return input.hasUnlimited || input.creditBalance > 0
}

export function hoursUntil(startAt: Date, now: Date) {
  return (startAt.getTime() - now.getTime()) / (1000 * 60 * 60)
}

export function canMemberCancelBooking(input: {
  hoursUntilClass: number
  cancellationWindowHours: number
  role: string
}) {
  if (input.role === 'ADMIN') return true
  return input.hoursUntilClass >= input.cancellationWindowHours
}
