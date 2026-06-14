import type { CollectionStatus, MediaType } from '../types'

// Normalizes to the format the frontend expects:
// "Pending", "InProgress", "Completed", "Dropped"
const STATUS_MAP: Record<string, CollectionStatus> = {
  pending: 'Pending',
  inprogress: 'InProgress',
  completed: 'Completed',
  dropped: 'Dropped',
}

const MEDIA_TYPE_MAP: Record<string, MediaType> = {
  movie: 'Movie',
  series: 'Series',
  book: 'Book',
  game: 'Game',
}

export function normalizeStatus(status: string): CollectionStatus {
  return STATUS_MAP[status.toLowerCase()] ?? (status as CollectionStatus)
}

export function normalizeMediaType(type: string): MediaType {
  return MEDIA_TYPE_MAP[type.toLowerCase()] ?? (type as MediaType)
}