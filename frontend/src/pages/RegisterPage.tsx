import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { register as registerService } from '../services/authService'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/collection" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await registerService({ email, username, password })
      login(token, false)
      navigate('/collection')
    } catch {
      setError(t('auth.registrationError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'var(--gradient-brand)' }}
          >
            Rewind
          </h1>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid rgba(124, 58, 237, 0.3)'
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text)' }}>
            {t('auth.register')}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="rounded-lg px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(124, 58, 237, 0.3)'
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('auth.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="rounded-lg px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(124, 58, 237, 0.3)'
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="rounded-lg px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  border: '1px solid rgba(124, 58, 237, 0.3)'
                }}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 rounded-lg text-sm font-semibold transition-opacity duration-200 cursor-pointer"
              style={{
                backgroundImage: 'var(--gradient-brand)',
                color: 'var(--color-text)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            <Link
              to="/login"
              className="transition-colors duration-200 hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              {t('auth.haveAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}