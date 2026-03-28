import { getSessionSecret } from '@/lib/env'

describe('auth env guards', () => {
  const original = process.env.APP_SESSION_SECRET
  const originalNextAuth = process.env.NEXTAUTH_SECRET

  afterEach(() => {
    if (original === undefined) {
      delete process.env.APP_SESSION_SECRET
    } else {
      process.env.APP_SESSION_SECRET = original
    }

    if (originalNextAuth === undefined) {
      delete process.env.NEXTAUTH_SECRET
    } else {
      process.env.NEXTAUTH_SECRET = originalNextAuth
    }
  })

  it('throws when no session secret is configured', () => {
    delete process.env.APP_SESSION_SECRET
    delete process.env.NEXTAUTH_SECRET
    expect(() => getSessionSecret()).toThrow(/Missing APP_SESSION_SECRET/)
  })

  it('throws for weak placeholder secrets', () => {
    process.env.APP_SESSION_SECRET = 'your-secret-key-change-in-production'
    expect(() => getSessionSecret()).toThrow(/Insecure APP_SESSION_SECRET/)
  })

  it('returns APP_SESSION_SECRET when valid', () => {
    process.env.APP_SESSION_SECRET = '12345678901234567890123456789012'
    expect(getSessionSecret()).toBe('12345678901234567890123456789012')
  })

  it('falls back to NEXTAUTH_SECRET when APP_SESSION_SECRET is absent', () => {
    delete process.env.APP_SESSION_SECRET
    process.env.NEXTAUTH_SECRET = 'abcdefghijklmnopqrstuvwxyz123456'
    expect(getSessionSecret()).toBe('abcdefghijklmnopqrstuvwxyz123456')
  })
})
