'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, register } from '@/lib/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    let result
    if (isLogin) {
      result = await login(email, password)
    } else {
      result = await register({ email, name, password })
    }

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="auth-logo">
            Vibe Studio
          </Link>
          <h1 className="auth-title">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in to manage your bookings'
              : 'Join our community and start booking'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                placeholder="Sarah Chen"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="********"
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <>
              <span className="auth-footer-text">Don't have an account?</span>
              <button onClick={() => setIsLogin(false)} className="auth-link">
                Sign up
              </button>
            </>
          ) : (
            <>
              <span className="auth-footer-text">Already have an account?</span>
              <button onClick={() => setIsLogin(true)} className="auth-link">
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="auth-demo">
          <p className="auth-demo-title">Demo accounts</p>
          <div className="auth-demo-list">
            <div className="auth-demo-item">
              <span className="auth-demo-role">Admin:</span>
              <code>admin@vibestudio.com</code>
            </div>
            <div className="auth-demo-item">
              <span className="auth-demo-role">Member:</span>
              <code>sarah@example.com</code>
            </div>
            <div className="auth-demo-item">
              <span className="auth-demo-role">Password:</span>
              <code>member123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
