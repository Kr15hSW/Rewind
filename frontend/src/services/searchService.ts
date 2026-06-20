import type { SearchResult } from '../types'

const PYTHON_URL = import.meta.env.VITE_PYTHON_SERVICE_URL ?? 'http://localhost:5000'

export async function searchMovies(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${PYTHON_URL}/api/search?type=movie&query=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

export async function searchSeries(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${PYTHON_URL}/api/search?type=series&query=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

export async function searchGames(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${PYTHON_URL}/api/search?type=game&query=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${PYTHON_URL}/api/search?type=book&query=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

// searchAll makes 1 request to the python service, which calls all 4 services parallely
export async function searchAll(query: string): Promise<SearchResult[]> {
  const res = await fetch(`${PYTHON_URL}/api/search?type=all&query=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}