import type { SearchResult, MediaType } from '../types'

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const RAWG_KEY = import.meta.env.VITE_RAWG_API_KEY
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any

export async function searchMovies(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=es-ES`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).slice(0, 12).map((item: AnyObj): SearchResult => ({
    externalId: `tmdb-movie-${item.id}`,
    title: item.title ?? item.original_title ?? 'Sin título',
    type: 'Movie' as MediaType,
    coverUrl: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null,
    year: item.release_date ? Number(item.release_date.split('-')[0]) : null,
    description: item.overview ?? null,
    genres: [],
  }))
}

export async function searchSeries(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=es-ES`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).slice(0, 12).map((item: AnyObj): SearchResult => ({
    externalId: `tmdb-series-${item.id}`,
    title: item.name ?? item.original_name ?? 'Sin título',
    type: 'Series' as MediaType,
    coverUrl: item.poster_path ? `${TMDB_IMG}${item.poster_path}` : null,
    year: item.first_air_date ? Number(item.first_air_date.split('-')[0]) : null,
    description: item.overview ?? null,
    genres: [],
  }))
}

export async function searchGames(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=12`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).map((item: AnyObj): SearchResult => ({
    externalId: `rawg-${item.id}`,
    title: item.name ?? 'Sin título',
    type: 'Game' as MediaType,
    coverUrl: item.background_image ?? null,
    year: item.released ? Number(item.released.split('-')[0]) : null,
    description: null,
    genres: (item.genres ?? []).map((g: AnyObj) => g.name),
    // RAWG incluye las plataformas directamente en la búsqueda
    platforms: (item.platforms ?? [])
      .map((p: AnyObj) => p.platform?.name)
      .filter((name: unknown): name is string => Boolean(name)),
  }))
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,cover_i,first_publish_year,author_name,subject,isbn`,
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs ?? []).slice(0, 12).map((item: AnyObj): SearchResult => ({
    externalId: `openlibrary-${(item.key ?? '').replace('/works/', '')}`,
    title: item.title ?? 'Sin título',
    type: 'Book' as MediaType,
    coverUrl: item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
      : null,
    year: item.first_publish_year ?? null,
    description: item.author_name ? `de ${item.author_name[0]}` : null,
    genres: (item.subject ?? []).slice(0, 3),
    author: item.author_name?.[0] ?? null,
    isbn: item.isbn?.[0] ?? null,
  }))
}

// Call all 4 services parallely and combine results
export async function searchAll(query: string): Promise<SearchResult[]> {
  const results = await Promise.allSettled([
    searchMovies(query),
    searchSeries(query),
    searchGames(query),
    searchBooks(query),
  ])
  return results
    .filter((r): r is PromiseFulfilledResult<SearchResult[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}