import type { CollectionStatus, MediaType } from '../types'


function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

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
  return STATUS_MAP[normalizeKey(status)] ?? (status as CollectionStatus)
}

export function normalizeMediaType(type: string): MediaType {
  return MEDIA_TYPE_MAP[normalizeKey(type)] ?? (type as MediaType)
}


const STATUS_TO_BACKEND: Record<CollectionStatus, string> = {
  Pending: 'pending',
  InProgress: 'in_progress',
  Completed: 'completed',
  Dropped: 'dropped',
}

export function toBackendStatus(status: CollectionStatus): string {
  return STATUS_TO_BACKEND[status]
}