import Link from 'next/link'
import { getSession } from '@/lib/actions/auth'

export default async function HomePage() {
  const session = await getSession()

  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Find your balance.<br />
          Build your strength.
        </h1>
        <p className="hero-description">
          Premium fitness studio offering yoga, pilates, barre, and strength
          training. Book classes that fit your schedule and your goals.
        </p>
        <div className="hero-actions">
          {session ? (
            <Link href="/schedule" className="btn btn-primary btn-lg">
              View Schedule
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary btn-lg">
                Member Sign In
              </Link>
              <Link href="/schedule" className="btn btn-secondary btn-lg">
                Browse Classes
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="hero-features">
        <div className="feature">
          <div className="feature-icon">🧘</div>
          <h3 className="feature-title">Yoga</h3>
          <p className="feature-description">
            Vinyasa, restorative, and mindfulness practices
          </p>
        </div>
        <div className="feature">
          <div className="feature-icon">💪</div>
          <h3 className="feature-title">Pilates</h3>
          <p className="feature-description">
            Reformer and mat pilates for core strength
          </p>
        </div>
        <div className="feature">
          <div className="feature-icon">🩰</div>
          <h3 className="feature-title">Barre</h3>
          <p className="feature-description">
            Ballet-inspired workout for lean muscles
          </p>
        </div>
        <div className="feature">
          <div className="feature-icon">🏋️</div>
          <h3 className="feature-title">Strength</h3>
          <p className="feature-description">
            Functional training and conditioning
          </p>
        </div>
      </div>
    </div>
  )
}
