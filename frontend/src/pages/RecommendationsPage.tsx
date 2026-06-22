import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchResult } from '../types'
import { getRecommendations, type RecommendationReason } from '../services/recommendationService'
import RecommendationCard from '../components/RecommendationCard'
import AddToCollectionModal from '../components/AddToCollectionModal'

export default function RecommendationsPage() {
  const { t } = useTranslation()
  const [results, setResults]       = useState<SearchResult[]>([])
  const [reason, setReason]         = useState<RecommendationReason>('ok')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [selected, setSelected]     = useState<SearchResult | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(false)
    getRecommendations()
      .then(data => {
        setResults(data.results)
        setReason(data.reason)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const handleSuccess = (message: string) => {
    // Elimina el elemento recién añadido de las recomendaciones
    if (selected) {
      setResults(prev => prev.filter(r => r.externalId !== selected.externalId))
    }
    setSuccessMsg(message)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const emptyMessage = (() => {
    if (reason === 'empty_collection') return t('recommendations.emptyCollection')
    if (reason === 'no_scores')        return t('recommendations.emptyNoScores')
    return t('recommendations.emptyNoResults')
  })()

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{
        fontSize: '1.6rem', fontWeight: 700,
        color: 'var(--color-text)',
        marginBottom: '24px',
      }}>
        {t('recommendations.title')}
      </h1>

      {/* Banner de éxito */}
      {successMsg && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 18px',
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '10px',
          color: '#4ADE80',
          fontSize: '0.88rem',
        }}>
          {successMsg}
        </div>
      )}

      {loading && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: '60px' }}>
          {t('recommendations.loading')}
        </p>
      )}

      {!loading && error && (
        <p style={{ color: '#F87171', textAlign: 'center', paddingTop: '60px' }}>
          {t('recommendations.error')}
        </p>
      )}

      {!loading && !error && results.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: '60px' }}>
          {emptyMessage}
        </p>
      )}

      {!loading && !error && results.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '20px',
        }}>
          {results.map(item => (
            <RecommendationCard
              key={item.externalId}
              item={item}
              onAdd={setSelected}
            />
          ))}
        </div>
      )}

      <AddToCollectionModal
        result={selected}
        onClose={() => setSelected(null)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}