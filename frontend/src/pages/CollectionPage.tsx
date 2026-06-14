import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CollectionEntryResponse, CollectionStatus, MediaType } from '../types'
import { getCollection, deleteFromCollection } from '../services/mediaService'
import { normalizeStatus, normalizeMediaType } from '../utils/status'
import { getTypeTooltip, getScoreTooltip } from '../utils/scoreTooltip'
import MediaCard from '../components/MediaCard'
import FilterBar, { type TypeFilter, type StatusFilter } from '../components/FilterBar'
import EditCollectionEntryModal from '../components/EditCollectionEntryModal'

export default function CollectionPage() {
  const { t, i18n } = useTranslation()
  const [entries,      setEntries]      = useState<CollectionEntryResponse[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [editingEntry, setEditingEntry] = useState<CollectionEntryResponse | null>(null)
  const [toast,        setToast]        = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCollection()
      setEntries(data.map(e => ({
        ...e,
        status: normalizeStatus(e.status),
        mediaItem: { ...e.mediaItem, type: normalizeMediaType(e.mediaItem.type) },
      })))
    } catch {
      setError(t('collection.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('collection.removeConfirm'))) return
    try {
      await deleteFromCollection(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      alert(t('common.error'))
    }
  }

  const handleUpdated = (
    id: string,
    status: CollectionStatus,
    score: number | null,
    review: string | null,
  ) => {
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status, score, review } : e,
    ))
  }

  const filtered = entries.filter(e => {
    if (typeFilter   !== 'All' && e.mediaItem.type !== typeFilter)   return false
    if (statusFilter !== 'All' && e.status         !== statusFilter) return false
    return true
  })

  // Idioma actual ("es" o "en") para elegir los textos de los tooltips.
  // resolvedLanguage tiene en cuenta el fallback configurado (español).
  const lang = (i18n.resolvedLanguage ?? i18n.language).startsWith('es') ? 'es' : 'en'

  // Totales por tipo — SIEMPRE sobre toda la colección, sin filtrar.
  // Los iconos 🎬📺📚🎮 muestran "cuánto tienes en total de cada tipo".
  const typeCounts = {
    Movie:  entries.filter(e => e.mediaItem.type === 'Movie').length,
    Series: entries.filter(e => e.mediaItem.type === 'Series').length,
    Book:   entries.filter(e => e.mediaItem.type === 'Book').length,
    Game:   entries.filter(e => e.mediaItem.type === 'Game').length,
  }

  // Puntuación media — sobre lo que se está mostrando AHORA (filtered),
  // así que cambia con los filtros. "–" si nada de lo mostrado tiene puntuación.
  const visibleScores = filtered.map(e => e.score).filter((s): s is number => s !== null)
  const hasScore = visibleScores.length > 0
  const avgLabel = hasScore
    ? `${(visibleScores.reduce((a, b) => a + b, 0) / visibleScores.length).toFixed(1)}/10`
    : '–'
  const scoreTooltip = getScoreTooltip(typeFilter, statusFilter, hasScore, lang)

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px' }}>
        {t('collection.title')}
      </h1>

      {/* Toast de éxito */}
      {toast && (
        <div style={{
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.35)',
          borderRadius: '8px', padding: '10px 16px',
          marginBottom: '20px',
          color: '#4ADE80', fontSize: '0.88rem',
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Estadísticas */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {(
            [
              { type: 'Movie',  emoji: '🎬', value: typeCounts.Movie  },
              { type: 'Series', emoji: '📺', value: typeCounts.Series },
              { type: 'Book',   emoji: '📚', value: typeCounts.Book   },
              { type: 'Game',   emoji: '🎮', value: typeCounts.Game   },
            ] as { type: MediaType; emoji: string; value: number }[]
          )
            .filter(s => s.value > 0)
            .map(s => (
              <Stat
                key={s.type}
                emoji={s.emoji}
                label={String(s.value)}
                title={getTypeTooltip(s.type, lang)}
              />
            ))}
          <Stat emoji="⭐" label={avgLabel} title={scoreTooltip} />
        </div>
      )}

      {/* Estados de carga / error / vacío */}
      {loading && (
        <p style={{ color: 'var(--color-text-muted)' }}>{t('collection.loading')}</p>
      )}

      {error && !loading && (
        <p style={{ color: '#F87171' }}>
          {error}{' '}
          <button
            onClick={load}
            style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t('common.retry')}
          </button>
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            {t('collection.empty')}
          </p>
          <Link
            to="/search"
            style={{
              background: 'var(--gradient-brand)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {t('nav.explore')} →
          </Link>
        </div>
      )}

      {/* Grid de colección */}
      {!loading && !error && entries.length > 0 && (
        <>
          <FilterBar
            typeFilter={typeFilter}     onTypeChange={setTypeFilter}
            statusFilter={statusFilter} onStatusChange={setStatusFilter}
            total={filtered.length}
          />

          {filtered.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
              {t('collection.noFilterResults')}
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
              gap: '20px',
            }}>
              {filtered.map(entry => (
                <MediaCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDelete}
                  onEdit={setEditingEntry}
                />
              ))}
            </div>
          )}
        </>
      )}

      <EditCollectionEntryModal
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSuccess={showToast}
        onUpdated={handleUpdated}
      />
    </div>
  )
}

function Stat({ emoji, label, title }: { emoji: string; label: string; title?: string }) {
  return (
    <div
      title={title}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: '10px',
        padding: '8px 16px',
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '0.88rem',
      }}
    >
      <span>{emoji}</span>
      <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{label}</span>
    </div>
  )
}