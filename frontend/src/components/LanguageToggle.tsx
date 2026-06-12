import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  return (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
      className="text-xs font-medium px-2 py-1 rounded transition-colors duration-200 cursor-pointer"
      style={{ color: 'var(--color-text-muted)' }}
    >
      {i18n.language === 'es' ? 'EN' : 'ES'}
    </button>
  )
}