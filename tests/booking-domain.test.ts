import {
  canMemberCancelBooking,
  hasBookingEntitlement,
  hoursUntil,
} from '@/lib/domain/booking'

describe('booking domain rules', () => {
  it('allows booking for unlimited members', () => {
    expect(hasBookingEntitlement({ hasUnlimited: true, creditBalance: 0 })).toBe(true)
  })

  it('allows booking with positive credits', () => {
    expect(hasBookingEntitlement({ hasUnlimited: false, creditBalance: 2 })).toBe(true)
  })

  it('blocks booking without unlimited or credits', () => {
    expect(hasBookingEntitlement({ hasUnlimited: false, creditBalance: 0 })).toBe(false)
  })

  it('computes hours until class start', () => {
    const now = new Date('2026-01-01T10:00:00.000Z')
    const classStart = new Date('2026-01-01T15:00:00.000Z')
    expect(hoursUntil(classStart, now)).toBe(5)
  })

  it('allows admin cancellations inside cancellation window', () => {
    expect(
      canMemberCancelBooking({
        hoursUntilClass: 1,
        cancellationWindowHours: 12,
        role: 'ADMIN',
      })
    ).toBe(true)
  })

  it('blocks member cancellations inside cancellation window', () => {
    expect(
      canMemberCancelBooking({
        hoursUntilClass: 1,
        cancellationWindowHours: 12,
        role: 'MEMBER',
      })
    ).toBe(false)
  })
})
