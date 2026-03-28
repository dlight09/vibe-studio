import { checkRateLimit } from '@/lib/rate-limit'

describe('rate limiter', () => {
  it('allows requests up to max', () => {
    const key = `test:${Date.now()}`

    expect(checkRateLimit(key, { windowMs: 1_000, max: 2 }).allowed).toBe(true)
    expect(checkRateLimit(key, { windowMs: 1_000, max: 2 }).allowed).toBe(true)

    const third = checkRateLimit(key, { windowMs: 1_000, max: 2 })
    expect(third.allowed).toBe(false)
    expect(third.retryAfterSeconds).toBeGreaterThan(0)
  })
})
