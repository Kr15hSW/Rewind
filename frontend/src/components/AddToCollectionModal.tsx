import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SearchResult, CollectionStatus } from '../types'
import { createMediaItem, addToCollection } from '../services/mediaService'

interface Props {
  result:    SearchResult | null
  onClose:   () => void
  onSuccess: (message: string) => void
}

const STATUSES: CollectionStatus[] = ['Pending', 'InProgress', 'Completed', 'Dropped']

const TYPE_EMOJI: Record<string, string> = {
  Movie: '🎬', Series: '📺', Book: '📚', Game: '🎮',
}

export default function AddToCollectionModal({ result, onClose, onSuccess }: Props) {
  const { t } = useTranslation()
  const [status,  setStatus]  = useState<CollectionStatus>('Pending')
  const [score,   setScore]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  if (!result) return null

  const handleAdd = async () => {
    setLoading(true)
    setError(null)
    try {
      // Crea el ítem en la base de datos
      const media = await createMediaItem({
        title:       result.title,
        type:        result.type,
        description: result.description  ?? undefined,
        coverUrl:    result.coverUrl     ?? undefined,
        releaseYear:        result.year         ?? undefined,
        genres:      result.genres,
        externalId:  result.externalId,
      })
      // Lo añade a la colección del usuario
      await addToCollection({
        mediaItemId: media.id,
        status,
        score: score !== '' ? Number(score) : undefined,
      })
      onSuccess(t('search.addModal.successMessage', { title: result.title }))
      onClose()
    } catch (err) {
      if (err instanceof Error && err.message === 'already_in_collection') {
        setError(t('search.addModal.alreadyAdded'))
      } else {
        setError(t('search.addModal.errorMessage'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 400,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 401,
        background: 'var(--color-surface)',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: '16px',
        padding: '28px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
      }}>
        {/* Info del ítem */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '22px' }}>
          {result.coverUrl ? (
            <img
              src={result.coverUrl}
              alt={result.title}
              style={{ width: '68px', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '68px', aspectRatio: '2/3', flexShrink: 0,
              background: 'rgba(124,58,237,0.12)', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
            }}>
              {TYPE_EMOJI[result.type]}
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
              {result.title}
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
              {[result.year, t(`search.type.${result.type}`)].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <h3 style={{ margin: '0 0 18px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {t('search.addModal.title')}
        </h3>

        {/* Selector de estado */}
        <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {t('search.addModal.status')}
        </p>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: '6px 13px', borderRadius: '6px',
                border: '1.5px solid',
                borderColor: status === s ? 'var(--color-primary)' : 'rgba(124,58,237,0.25)',
                background:  status === s ? 'rgba(124,58,237,0.18)' : 'transparent',
                color:       status === s ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontSize: '0.8rem', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t(`collection.status.${s}`)}
            </button>
          ))}
        </div>

        {/* Puntuación */}
        <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {t('search.addModal.score')}
        </p>
        <input
          type="number"
          min={1} max={10}
          value={score}
          onChange={e => setScore(e.target.value)}
          placeholder="—"
          style={{
            width: '100%',
            padding: '9px 12px',
            background: 'rgba(124,58,237,0.07)',
            border: '1.5px solid rgba(124,58,237,0.25)',
            borderRadius: '8px',
            color: 'var(--color-text)',
            fontSize: '0.9rem', outline: 'none',
            marginBottom: '20px',
            boxSizing: 'border-box',
          }}
        />

        {error && (
          <p style={{ color: '#F87171', fontSize: '0.83rem', marginBottom: '12px' }}>{error}</p>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px',
              background: 'transparent',
              border: '1.5px solid rgba(124,58,237,0.3)',
              borderRadius: '8px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            {t('search.addModal.cancel')}
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            style={{
              flex: 1, padding: '10px',
              background: 'var(--gradient-brand)',
              border: 'none', borderRadius: '8px',
              color: 'white', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontSize: '0.9rem',
            }}
          >
            {loading ? t('common.loading') : t('search.addModal.confirm')}
          </button>
        </div>
      </div>
    </>
  )
}