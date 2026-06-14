import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CollectionEntryResponse, CollectionStatus } from '../types'
import { updateCollectionEntry } from '../services/mediaService'

interface Props {
  entry: CollectionEntryResponse | null
  onClose: () => void
  onSuccess: (message: string) => void
  onUpdated: (id: string, status: CollectionStatus, score: number | null, review: string | null) => void
}

const STATUSES: CollectionStatus[] = ['Pending', 'InProgress', 'Completed', 'Dropped']

const TYPE_EMOJI: Record<string, string> = {
  Movie: '🎬', Series: '📺', Book: '📚', Game: '🎮',
}

export default function EditCollectionEntryModal({ entry, onClose, onSuccess, onUpdated }: Props) {
  if (!entry) return null

  // The key forces React to create a new instance of the form every time
  // there is an entry change, so that every field always starts with the
  // right value, without using useEffect
  return (
    <EditForm
      key={entry.id}
      entry={entry}
      onClose={onClose}
      onSuccess={onSuccess}
      onUpdated={onUpdated}
    />
  )
}

function EditForm({ entry, onClose, onSuccess, onUpdated }: { entry: CollectionEntryResponse } & Omit<Props, 'entry'>) {
  const { t } = useTranslation()
  const [status,  setStatus]  = useState<CollectionStatus>(entry.status)
  const [score,   setScore]   = useState(entry.score !== null ? String(entry.score) : '')
  const [review,  setReview]  = useState(entry.review ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const { mediaItem } = entry

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    const finalScore  = score !== '' ? Number(score) : null
    const finalReview = review.trim() !== '' ? review.trim() : null
    try {
      await updateCollectionEntry(entry.id, {
        status,
        score:  finalScore,
        review: finalReview,
      })
      onUpdated(entry.id, status, finalScore, finalReview)
      onSuccess(t('collection.editModal.successMessage'))
      onClose()
    } catch (err) {
      console.error('Error al actualizar la entrada:', err)
      setError(t('collection.editModal.errorMessage'))
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
        width: '100%', maxWidth: '420px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        boxSizing: 'border-box',
      }}>
        {/* Info del ítem */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '22px' }}>
          {mediaItem.coverUrl ? (
            <img
              src={mediaItem.coverUrl}
              alt={mediaItem.title}
              style={{ width: '68px', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: '68px', aspectRatio: '2/3', flexShrink: 0,
              background: 'rgba(124,58,237,0.12)', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
            }}>
              {TYPE_EMOJI[mediaItem.type]}
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
              {mediaItem.title}
            </p>
            {mediaItem.releaseYear && (
              <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                {mediaItem.releaseYear}
              </p>
            )}
          </div>
        </div>

        <h3 style={{ margin: '0 0 18px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {t('collection.editModal.title')}
        </h3>

        {/* Selector de estado */}
        <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {t('collection.editModal.status')}
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
          {t('collection.editModal.score')}
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
            marginBottom: '18px',
            boxSizing: 'border-box',
          }}
        />

        {/* Reseña */}
        <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          {t('collection.editModal.review')}
        </p>
        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder={t('collection.editModal.reviewPlaceholder')}
          rows={4}
          style={{
            width: '100%',
            padding: '9px 12px',
            background: 'rgba(124,58,237,0.07)',
            border: '1.5px solid rgba(124,58,237,0.25)',
            borderRadius: '8px',
            color: 'var(--color-text)',
            fontSize: '0.875rem', outline: 'none',
            marginBottom: '20px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical',
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
            {t('collection.editModal.cancel')}
          </button>
          <button
            onClick={handleSave}
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
            {loading ? t('common.loading') : t('collection.editModal.save')}
          </button>
        </div>
      </div>
    </>
  )
}