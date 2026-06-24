import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from './LanguageToggle'

export default function Navbar() {
  const { t }      = useTranslation()
  const { logout, user } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [open, setOpen] = useState(false)
  const dropRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { setOpen(false); logout(); navigate('/login') }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
      display: 'flex', alignItems: 'center', paddingInline: '24px', zIndex: 100,
      background: 'var(--color-surface)',
      borderBottom: '2px solid transparent',
      backgroundImage:  'linear-gradient(var(--color-surface), var(--color-surface)), var(--gradient-brand)',
      backgroundOrigin: 'border-box',
      backgroundClip:   'padding-box, border-box',
    } as React.CSSProperties}>

      <Link to="/collection" style={{
        fontSize: '1.4rem', fontWeight: 800,
        background: 'var(--gradient-brand)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        textDecoration: 'none', letterSpacing: '-0.02em', flexShrink: 0,
      }}>
        Rewind
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '32px' }}>
        <NavLink to="/collection"      active={location.pathname === '/collection'}>      {t('nav.collection')}     </NavLink>
        <NavLink to="/search"          active={location.pathname === '/search'}>          {t('nav.explore')}        </NavLink>
        <NavLink to="/recommendations" active={location.pathname === '/recommendations'}> {t('nav.recommendations')}</NavLink>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <LanguageToggle />

        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(p => !p)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--gradient-brand)',
              border: 'none', cursor: 'pointer',
              color: 'white', fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--color-surface)',
              border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px',
              padding: '6px', minWidth: '164px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)', zIndex: 200,
            }}>
              <DropdownItem icon="👤" label={t('nav.profile')}  onClick={() => { setOpen(false); navigate('/profile')  }} />
              <DropdownItem icon="⚙️" label={t('nav.settings')} onClick={() => { setOpen(false); navigate('/settings') }} />
              <div style={{ height: '1px', background: 'rgba(124,58,237,0.18)', margin: '4px 0' }} />
              <DropdownItem icon="🚪" label={t('nav.logout')} danger onClick={handleLogout} />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link to={to} style={{
      color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
      textDecoration: 'none', fontSize: '0.9rem',
      fontWeight: active ? 600 : 400, paddingBottom: '2px',
      borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
      transition: 'color 0.2s',
    }}>
      {children}
    </Link>
  )
}

function DropdownItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick?: () => void; danger?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px',
        background: hovered ? 'rgba(124,58,237,0.13)' : 'none',
        border: 'none', borderRadius: '8px',
        cursor: 'pointer',
        color: danger ? '#F87171' : 'var(--color-text)',
        fontSize: '0.875rem', textAlign: 'left', transition: 'background 0.15s',
      }}
    >
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  )
}