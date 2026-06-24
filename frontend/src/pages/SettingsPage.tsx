import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { deleteUser } from '../services/userService'

export default function SettingsPage() {
  const { t }                  = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { logout }             = useAuth()
  const navigate               = useNavigate()
  const [deleting,   setDeleting]   = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirm(t('settings.deleteConfirm'))) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteUser()
      logout()
      navigate('/login')
    } catch {
      setDeleteError(t('settings.deleteError'))
      setDeleting(false)
    }
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '32px', color: 'var(--color-text)' }}>
        {t('settings.title')}
      </h1>

      {/* ── Apariencia ── */}
      <SettingsSection title={t('settings.themeSection')}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ThemeBtn label={t('settings.darkTheme')}  icon="🌙" active={theme === 'dark'}  onClick={() => theme !== 'dark'  && toggleTheme()} />
          <ThemeBtn label={t('settings.lightTheme')} icon="☀️" active={theme === 'light'} onClick={() => theme !== 'light' && toggleTheme()} />
        </div>
      </SettingsSection>

      {/* ── Zona de peligro ── */}
      <SettingsSection title={t('settings.dangerSection')} danger>
        {deleteError && (
          <p style={{ color: '#F87171', fontSize: '0.85rem', marginBottom: '12px' }}>{deleteError}</p>
        )}
        <button
          onClick={handleDelete} disabled={deleting}
          style={{
            padding: '10px 20px',
            background: 'rgba(239,68,68,0.1)',
            border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: '8px',
            color: '#F87171', fontWeight: 600, fontSize: '0.9rem',
            cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1,
          }}
        >
          {deleting ? t('common.loading') : `🗑 ${t('settings.deleteAccount')}`}
        </button>
      </SettingsSection>
    </div>
  )
}

function SettingsSection({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{
      marginBottom: '24px', padding: '24px',
      background: 'var(--color-surface)',
      border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.2)'}`,
      borderRadius: '14px',
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: danger ? '#F87171' : 'var(--color-text)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function ThemeBtn({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 20px', borderRadius: '10px',
        border: '1.5px solid',
        borderColor: active ? 'var(--color-primary)' : 'rgba(124,58,237,0.25)',
        background:  active ? 'rgba(124,58,237,0.18)' : 'transparent',
        color:       active ? 'var(--color-text)' : 'var(--color-text-muted)',
        cursor: 'pointer', fontSize: '0.9rem', fontWeight: active ? 600 : 400,
        display: 'flex', alignItems: 'center', gap: '8px',
        transition: 'all 0.15s',
      }}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  )
}