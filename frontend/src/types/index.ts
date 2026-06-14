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
  releaseYear: number | null
  genres: string[]
  externalId: string | null

  // Specific fields for types, null or not according to mediaType
  director?: string | null
  durationMinutes?: number | null
  originalLanguage?: string | null
  creator?: string | null
  totalSeasons?: number | null
  totalEpisodes?: number | null
  seriesStatus?: string | null
  author?: string | null
  publisher?: string | null
  pages?: number | null
  isbn?: string | null
  developer?: string | null
  platforms?: string[]
}

// GET /api/collection (array)
export interface CollectionEntryResponse {
  id: string
  status: CollectionStatus
  score: number | null
  review: string | null
  platformPlayed: string | null
  addedAt: string
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
  platformPlayed?: string
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