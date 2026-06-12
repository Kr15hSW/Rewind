import { useTranslation } from 'react-i18next'

export default function CollectionPage() {
  const { t } = useTranslation()
  return <h1>{t('collection.title')}</h1>
}