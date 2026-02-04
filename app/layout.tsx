import '@/styles/globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'

export const metadata: Metadata = {
  title: 'Vibe Studio',
  description: 'Premium fitness studio for yoga, pilates, and strength training.',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-logo">
              Vibe Studio
            </Link>
            <div className="nav-links">
              <Link href="/schedule" className="nav-link">
                Schedule
              </Link>
              <Link href="/instructors" className="nav-link">
                Instructors
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="nav-link">
                    My Bookings
                  </Link>
                  {(session.role === 'STAFF' || session.role === 'ADMIN') && (
                    <Link href="/admin" className="nav-link">
                      Admin
                    </Link>
                  )}
                  <div className="nav-user">
                    <div className="avatar">{getInitials(session.name)}</div>
                    <span className="nav-user-name">{session.name}</span>
                    <form action="/api/auth/logout" method="POST">
                      <button type="submit" className="btn btn-ghost btn-sm">
                        Log out
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn btn-primary btn-sm">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
