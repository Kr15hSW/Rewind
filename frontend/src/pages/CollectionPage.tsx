import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CollectionEntryResponse } from '../types'
import { getCollection, deleteFromCollection } from '../services/mediaService'
import MediaCard from '../components/MediaCard'
import FilterBar, { type TypeFilter, type StatusFilter } from '../components/FilterBar'
import { normalizeStatus, normalizeMediaType } from '../utils/status'

export default function CollectionPage() {
  const { t } = useTranslation()
  const [entries,      setEntries]      = useState<CollectionEntryResponse[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

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

  const handleDelete = async (id: string) => {
    if (!confirm(t('collection.removeConfirm'))) return
    try {
      await deleteFromCollection(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      alert(t('common.error'))
    }
  }

  const filtered = entries.filter(e => {
    if (typeFilter   !== 'All' && e.mediaItem.type !== typeFilter)   return false
    if (statusFilter !== 'All' && e.status         !== statusFilter) return false
    return true
  })

  // Estadísticas rápidas
  const scores   = entries.map(e => e.score).filter((s): s is number => s !== null)
  const avgScore = scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : null

  const typeCounts = {
    Movie:  entries.filter(e => e.mediaItem.type === 'Movie').length,
    Series: entries.filter(e => e.mediaItem.type === 'Series').length,
    Book:   entries.filter(e => e.mediaItem.type === 'Book').length,
    Game:   entries.filter(e => e.mediaItem.type === 'Game').length,
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px' }}>
        {t('collection.title')}
      </h1>

      {/* Estadísticas */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {(
            [
              { emoji: '🎬', value: typeCounts.Movie  },
              { emoji: '📺', value: typeCounts.Series },
              { emoji: '📚', value: typeCounts.Book   },
              { emoji: '🎮', value: typeCounts.Game   },
            ] as { emoji: string; value: number }[]
          )
            .filter(s => s.value > 0)
            .map((s, i) => (
              <Stat key={i} emoji={s.emoji} label={String(s.value)} />
            ))}
          {avgScore && <Stat emoji="⭐" label={`${avgScore}/10`} />}
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
                <MediaCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: '10px',
      padding: '8px 16px',
      display: 'flex', alignItems: 'center', gap: '8px',
      fontSize: '0.88rem',
    }}>
      <span>{emoji}</span>
      <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{label}</span>
    </div>
  )
}