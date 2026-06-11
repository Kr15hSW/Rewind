import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* Logo */}
      <Link to="/collection">
        <span
          className="text-xl font-bold bg-clip-text text-transparent"
          style={{ backgroundImage: 'var(--gradient-brand)' }}
        >
          Rewind
        </span>
      </Link>

      {/* Enlaces de navegación */}
      <div className="flex items-center gap-8">
        <Link
          to="/collection"
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
        >
          Colección
        </Link>
        <Link
          to="/search"
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200"
        >
          Explorar
        </Link>
      </div>

      {/* Avatar de usuario (placeholder) */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold"
        style={{ backgroundImage: 'var(--gradient-brand)', color: 'var(--color-text)' }}
      >
        U
      </div>

      {/* Línea gradiente inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ backgroundImage: 'var(--gradient-brand)' }}
      />
    </nav>
  )
}