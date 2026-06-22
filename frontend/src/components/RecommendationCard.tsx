import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchResult, MediaType } from '../types'

const TYPE_EMOJI: Record<MediaType, string> = {
  Movie: '🎬', Series: '📺', Book: '📚', Game: '🎮',
}

interface Props {
  item:  SearchResult
  onAdd: (item: SearchResult) => void
}

export default function RecommendationCard({ item, onAdd }: Props) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Contenedor de la portada */}
      <div style={{ position: 'relative', aspectRatio: '2/3', borderRadius: '10px' }}>

        {/* Glow */}
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-6px',
              width: 'calc(100% + 12px)',
              height: 'calc(100% + 12px)',
              objectFit: 'cover',
              filter: 'blur(14px)',
              borderRadius: '14px',
              opacity: hovered ? 0.45 : 0,
              transition: 'opacity 0.35s ease',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '14px',
            background: 'rgba(124,58,237,0.6)',
            filter: 'blur(14px)',
            opacity: hovered ? 0.45 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        )}

        {/* Portada */}
        <div style={{
          position: 'relative',
          width: '100%', height: '100%',
          overflow: 'hidden',
          borderRadius: '10px',
          background: 'rgba(124,58,237,0.07)',
          border: '1px solid',
          borderColor: hovered ? 'rgba(124,58,237,0.45)' : 'rgba(124,58,237,0.15)',
          transform: hovered ? 'translateY(-4px)' : 'none',
          transition: 'transform 0.25s ease, border-color 0.25s ease',
          zIndex: 1,
        }}>
          {item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.8rem',
            }}>
              {TYPE_EMOJI[item.type]}
            </div>
          )}

          {/* Botón Añadir (solo en hover) */}
          {hovered && (
            <button
              onClick={() => onAdd(item)}
              style={{
                position: 'absolute', bottom: 7, right: 7,
                background: 'var(--gradient-brand)',
                border: 'none', borderRadius: '6px',
                padding: '5px 10px',
                color: 'white', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600,
              }}
            >
              + {t('search.add')}
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 4px 0' }}>
        <p style={{
          margin: 0,
          color: 'var(--color-text)', fontWeight: 600,
          fontSize: '0.875rem', lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {item.title}
        </p>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.76rem' }}>
          {item.year ? `${item.year} · ` : ''}{TYPE_EMOJI[item.type]}
        </p>
      </div>
    </div>
  )
}