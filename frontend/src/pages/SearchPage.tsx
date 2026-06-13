import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { SearchResult, MediaType } from '../types'
import {
  searchAll, searchMovies, searchSeries, searchBooks, searchGames,
} from '../services/searchService'
import AddToCollectionModal from '../components/AddToCollectionModal'

type SearchType = MediaType | 'All'

const TABS: { key: SearchType; emoji: string; i18n: string }[] = [
  { key: 'All',    emoji: '🔍', i18n: 'search.filter.all'    },
  { key: 'Movie',  emoji: '🎬', i18n: 'search.filter.movies' },
  { key: 'Series', emoji: '📺', i18n: 'search.filter.series' },
  { key: 'Book',   emoji: '📚', i18n: 'search.filter.books'  },
  { key: 'Game',   emoji: '🎮', i18n: 'search.filter.games'  },
]

const SEARCH_FNS: Record<SearchType, (q: string) => Promise<SearchResult[]>> = {
  All:    searchAll,
  Movie:  searchMovies,
  Series: searchSeries,
  Book:   searchBooks,
  Game:   searchGames,
}

export default function SearchPage() {
  const { t } = useTranslation()
  const [query,      setQuery]      = useState('')
  const [activeType, setActiveType] = useState<SearchType>('All')
  const [results,    setResults]    = useState<SearchResult[]>([])
  const [loading,    setLoading]    = useState(false)
  const [searched,   setSearched]   = useState(false)
  const [lastQuery,  setLastQuery]  = useState('')
  const [selected,   setSelected]   = useState<SearchResult | null>(null)
  const [toast,      setToast]      = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(true)
    setLastQuery(q)
    setToast(null)
    try {
      setResults(await SEARCH_FNS[activeType](q))
    } finally {
      setLoading(false)
    }
  }, [query, activeType])

  const handleTabChange = (type: SearchType) => {
    setActiveType(type)
    setResults([])
    setSearched(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>
        {t('search.title')}
      </h1>

      {/* Tabs de tipo */}
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: '7px 16px', borderRadius: '999px',
              border: '1.5px solid',
              borderColor: activeType === tab.key ? 'var(--color-primary)' : 'rgba(124,58,237,0.25)',
              background:  activeType === tab.key ? 'rgba(124,58,237,0.18)' : 'transparent',
              color:       activeType === tab.key ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontSize: '0.85rem',
              fontWeight: activeType === tab.key ? 600 : 400,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.18s',
            }}
          >
            <span>{tab.emoji}</span>
            <span>{t(tab.i18n)}</span>
          </button>
        ))}
      </div>

      {/* Barra de búsqueda */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={t('search.placeholder')}
          style={{
            flex: 1, padding: '12px 16px',
            background: 'var(--color-surface)',
            border: '1.5px solid rgba(124,58,237,0.25)',
            borderRadius: '10px',
            color: 'var(--color-text)', fontSize: '0.95rem', outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(124,58,237,0.25)')}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: '12px 24px',
            background: 'var(--gradient-brand)',
            border: 'none', borderRadius: '10px',
            color: 'white', fontWeight: 600, fontSize: '0.9rem',
            flexShrink: 0,
            cursor:  loading || !query.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !query.trim() ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? t('search.searching') : t('search.button')}
        </button>
      </div>

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

      {/* Estados */}
      {loading && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
          {t('search.searching')}
        </p>
      )}
      {!loading && searched && results.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
          {t('search.noResults', { query: lastQuery })}
        </p>
      )}

      {/* Grid de resultados */}
      {!loading && results.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
          gap: '18px',
        }}>
          {results.map(r => (
            <SearchCard key={r.externalId} result={r} onAdd={() => setSelected(r)} t={t} />
          ))}
        </div>
      )}

      <AddToCollectionModal
        result={selected}
        onClose={() => setSelected(null)}
        onSuccess={showToast}
      />
    </div>
  )
}

// Tarjeta de resultado de búsqueda

const EMOJI: Record<string, string> = { Movie: '🎬', Series: '📺', Book: '📚', Game: '🎮' }

function SearchCard({
  result, onAdd, t,
}: {
  result: SearchResult
  onAdd:  () => void
  t:      TFunction
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-surface)',
        borderRadius: '10px', overflow: 'hidden',
        border: '1px solid',
        borderColor: hovered ? 'rgba(124,58,237,0.45)' : 'rgba(124,58,237,0.15)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'transform 0.22s ease, border-color 0.22s ease',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: 'rgba(124,58,237,0.07)' }}>
        {result.coverUrl ? (
          <img
            src={result.coverUrl}
            alt={result.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.8rem',
          }}>
            {EMOJI[result.type]}
          </div>
        )}

        {/* Overlay de añadir */}
        {hovered && (
          <button
            onClick={onAdd}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.52)',
              backdropFilter: 'blur(2px)',
              border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '5px', color: 'white',
            }}
          >
            <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>+</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{t('search.add')}</span>
          </button>
        )}
      </div>

      <div style={{ padding: '10px 10px 12px' }}>
        <p style={{
          margin: 0, fontWeight: 600,
          fontSize: '0.875rem', lineHeight: 1.3,
          color: 'var(--color-text)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {result.title}
        </p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.76rem' }}>
          {[result.year ?? '—', t(`search.type.${result.type}`)].join(' · ')}
        </p>
      </div>
    </div>
  )
}