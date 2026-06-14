import type { CollectionStatus } from '../types'

// Normalizes to the format the frontend expects:
// "Pending", "InProgress", "Completed", "Dropped"
const STATUS_MAP: Record<string, CollectionStatus> = {
  pending: 'Pending',
  inprogress: 'InProgress',
  completed: 'Completed',
  dropped: 'Dropped',
}

export function normalizeStatus(status: string): CollectionStatus {
  return STATUS_MAP[status.toLowerCase()] ?? (status as CollectionStatus)
}