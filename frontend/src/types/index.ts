// enums and DTOs from backend C#

export type MediaType = 'Movie' | 'Series' | 'Book' | 'Game'
export type CollectionStatus = 'Pending' | 'InProgress' | 'Completed' | 'Dropped'

// GET /api/media/{id}
export interface MediaItemResponse {
  id: string
  title: string
  type: MediaType
  description: string | null
  coverUrl: string | null
  year: number | null
  genres: string[]
  externalId: string | null
}

// GET /api/collection (array)
export interface CollectionEntryResponse {
  id: string
  userId: string
  mediaItemId: string
  status: CollectionStatus
  score: number | null
  review: string | null
  startedAt: string | null
  finishedAt: string | null
  mediaItem: MediaItemResponse
}

// Body for POST /api/media
export interface CreateMediaItemRequest {
  title: string
  type: MediaType
  description?: string
  coverUrl?: string
  releaseYear?: number
  genres?: string[]
  externalId?: string
}

// Body for POST /api/collection
export interface AddToCollectionRequest {
  mediaItemId: string
  status: CollectionStatus
  score?: number
  review?: string
}

// Body for PUT /api/collection/{id}
export interface UpdateCollectionEntryRequest {
  status?: CollectionStatus
  score?: number
  review?: string
  startedAt?: string
  finishedAt?: string
}

// Result of searching in TMDB / RAWG / Open Library
// (built in searchService)
export interface SearchResult {
  externalId: string
  title: string
  type: MediaType
  coverUrl: string | null
  year: number | null
  description: string | null
  genres: string[]
}