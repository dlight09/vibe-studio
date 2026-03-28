const INSECURE_SECRETS = new Set([
  'fallback-secret',
  'your-secret-key-change-in-production',
  'changeme',
  'dev-secret',
])

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getSessionSecret(): string {
  const secret = (process.env.APP_SESSION_SECRET || process.env.NEXTAUTH_SECRET || '').trim()

  if (!secret) {
    throw new Error(
      'Missing APP_SESSION_SECRET (or NEXTAUTH_SECRET). Set a strong value with at least 32 characters.'
    )
  }

  if (secret.length < 32 || INSECURE_SECRETS.has(secret)) {
    throw new Error(
      'Insecure APP_SESSION_SECRET/NEXTAUTH_SECRET. Use at least 32 random characters.'
    )
  }

  return secret
}

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}
