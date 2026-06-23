import { useTranslation } from 'react-i18next'
import type { MediaType, CollectionStatus } from '../types'

export type TypeFilter   = MediaType | 'All'
export type StatusFilter = CollectionStatus | 'All'

interface Props {
  typeFilter:     TypeFilter
  onTypeChange:   (v: TypeFilter)   => void
  statusFilter:   StatusFilter
  onStatusChange: (v: StatusFilter) => void
  total: number
}

export default function FilterBar({ typeFilter, onTypeChange, statusFilter, onStatusChange, total }: Props) {
  const { t } = useTranslation()

  const typeOpts: { key: TypeFilter; label: string }[] = [
    { key: 'All',    label: t('collection.filter.all') },
    { key: 'Movie',  label: t('collection.filter.movies') },
    { key: 'Series', label: t('collection.filter.series') },
    { key: 'Book',   label: t('collection.filter.books') },
    { key: 'Game',   label: t('collection.filter.games') },
  ]

  const statusOpts: { key: StatusFilter; label: string }[] = [
    { key: 'All',        label: t('collection.filter.all') },
    { key: 'Pending',    label: t('collection.status.Pending') },
    { key: 'InProgress', label: t('collection.status.InProgress') },
    { key: 'Completed',  label: t('collection.status.Completed') },
    { key: 'Dropped',    label: t('collection.status.Dropped') },
  ]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '28px' }}>
      {/* Pills de tipo */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {typeOpts.map(opt => (
          <button
            key={opt.key}
            onClick={() => onTypeChange(opt.key)}
            style={{
              padding: '6px 15px',
              borderRadius: '999px',
              border: '1.5px solid',
              borderColor: typeFilter === opt.key ? 'var(--color-primary)' : 'rgba(124,58,237,0.25)',
              background:  typeFilter === opt.key ? 'rgba(124,58,237,0.18)' : 'transparent',
              color:       typeFilter === opt.key ? 'var(--color-text)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: typeFilter === opt.key ? 600 : 400,
              transition: 'all 0.18s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Separador */}
      <div style={{ width: '1px', height: '22px', background: 'rgba(124,58,237,0.2)' }} />

      {/* Selector de estado */}
      <select
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value as StatusFilter)}
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-muted)',
          border: '1.5px solid rgba(124,58,237,0.25)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {statusOpts.map(opt => (
          <option key={opt.key} value={opt.key}>{opt.label}</option>
        ))}
      </select>

      {/* Contador */}
      <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '0.83rem' }}>
        {total} {t(total === 1 ? 'collection.filter.item' : 'collection.filter.items')}
      </span>
    </div>
  )
}