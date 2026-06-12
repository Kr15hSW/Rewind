import { useTranslation } from 'react-i18next'

export default function SearchPage() {
  const { t } = useTranslation()
  return <h1>{t('search.title')}</h1>
}