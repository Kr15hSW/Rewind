import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CollectionEntryResponse, MediaType } from '../types'

const TYPE_EMOJI: Record<MediaType, string> = {
  Movie: '🎬', Series: '📺', Book: '📚', Game: '🎮',
}

const STATUS_BG: Record<string, string> = {
  Pending:    'rgba(168,158,201,0.15)',
  InProgress: 'rgba(59,130,246,0.15)',
  Completed:  'rgba(34,197,94,0.15)',
  Dropped:    'rgba(239,68,68,0.15)',
}

const STATUS_COLOR: Record<string, string> = {
  Pending:    '#A89EC9',
  InProgress: '#60A5FA',
  Completed:  '#4ADE80',
  Dropped:    '#F87171',
}

interface Props {
  entry:    CollectionEntryResponse
  onDelete: (id: string) => void
  onEdit:   (entry: CollectionEntryResponse) => void
}

export default function MediaCard({ entry, onDelete, onEdit }: Props) {
  const { t } = useTranslation()
  const [hovered,  setHovered]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const { mediaItem, status, score } = entry

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
    >
      {/* Contenedor de la portada
          El glow está anclado SOLO a este contenedor (no a toda la
          tarjeta) */}
      <div style={{
        position: 'relative',
        aspectRatio: '2/3',
        borderRadius: '10px',
      }}>

        {/* Glow - halo fino y uniforme alrededor de la portada */}
        {mediaItem.coverUrl ? (
          <img
            src={mediaItem.coverUrl}
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

        {/* Portada (recortada, encima del glow) - clic para editar */}
        <div
          onClick={() => onEdit(entry)}
          style={{
            position: 'relative',
            width: '100%', height: '100%',
            overflow: 'hidden',
            borderRadius: '10px',
            background: 'rgba(124,58,237,0.07)',
            border: '1px solid',
            borderColor: hovered ? 'rgba(124,58,237,0.45)' : 'rgba(124,58,237,0.15)',
            transform: hovered ? 'translateY(-4px)' : 'none',
            transition: 'transform 0.25s ease, border-color 0.25s ease',
            cursor: 'pointer',
            zIndex: 1,
          }}
        >
          {mediaItem.coverUrl ? (
            <img
              src={mediaItem.coverUrl}
              alt={mediaItem.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.8rem',
            }}>
              {TYPE_EMOJI[mediaItem.type]}
            </div>
          )}

          {/* Badge de puntuación */}
          {score !== null && score !== undefined && (
            <div style={{
              position: 'absolute', top: 7, right: 7,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(4px)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.78rem', fontWeight: 700,
              color: score >= 7 ? '#4ADE80' : score >= 5 ? '#FB923C' : '#F87171',
            }}>
              ★ {score}
            </div>
          )}

          {/* Botón ⋮ */}
          {hovered && (
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(p => !p) }}
              style={{
                position: 'absolute', top: 7, left: 7,
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(4px)',
                border: 'none', borderRadius: '6px',
                padding: '2px 8px',
                color: 'white', cursor: 'pointer',
                fontSize: '1.1rem', lineHeight: 1,
              }}
            >
              ⋮
            </button>
          )}

          {/* Menú contextual */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 36, left: 7,
              background: 'var(--color-surface)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              minWidth: '120px',
            }}>
              <button
                onClick={e => { e.stopPropagation(); onDelete(entry.id); setMenuOpen(false) }}
                style={{
                  width: '100%', padding: '9px 14px',
                  background: 'none', border: 'none',
                  color: '#F87171', cursor: 'pointer',
                  fontSize: '0.83rem', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}
              >
                🗑 {t('collection.remove')}
              </button>
            </div>
          )}

          {/* Pista de "clic para editar" (puramente visual) */}
          {hovered && (
            <div style={{
              position: 'absolute', bottom: 7, right: 7,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(4px)',
              borderRadius: '6px',
              padding: '3px 7px',
              fontSize: '0.8rem',
              color: 'white',
              pointerEvents: 'none',
            }}>
              ✎
            </div>
          )}
        </div>
      </div>

      {/* Info - fuera del contenedor del glow, no se ve afectada */}
      <div style={{ padding: '10px 4px 0' }}>
        <div style={{
          display: 'inline-block',
          padding: '2px 7px', borderRadius: '4px',
          fontSize: '0.68rem', fontWeight: 600,
          marginBottom: '6px',
          background: STATUS_BG[status]    ?? 'rgba(124,58,237,0.15)',
          color:      STATUS_COLOR[status] ?? 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {t(`collection.status.${status}`)}
        </div>

        <p style={{
          margin: 0,
          color: 'var(--color-text)', fontWeight: 600,
          fontSize: '0.875rem', lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {mediaItem.title}
        </p>

        {mediaItem.releaseYear && (
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.76rem' }}>
            {mediaItem.releaseYear} · {TYPE_EMOJI[mediaItem.type]}
          </p>
        )}
      </div>
    </div>
  )
}