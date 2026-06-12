import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from './LanguageToggle'

export default function Navbar() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <Link to="/collection">
        <span
          className="text-xl font-bold bg-clip-text text-transparent"
          style={{ backgroundImage: 'var(--gradient-brand)' }}
        >
          Rewind
        </span>
      </Link>

      <div className="flex items-center gap-8">
        <Link
          to="/collection"
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
        >
          {t('nav.collection')}
        </Link>
        <Link
          to="/search"
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
        >
          {t('nav.explore')}
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <LanguageToggle />
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold transition-opacity duration-200 hover:opacity-80"
          style={{ backgroundImage: 'var(--gradient-brand)', color: 'var(--color-text)' }}
        >
          U
        </button>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ backgroundImage: 'var(--gradient-brand)' }}
      />
    </nav>
  )
}