import type { SearchResult } from '../types'

const PYTHON_URL = import.meta.env.VITE_PYTHON_SERVICE_URL ?? 'http://localhost:5000'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export type RecommendationReason = 'ok' | 'empty_collection' | 'no_scores'

export interface RecommendationResponse {
  results: SearchResult[]
  reason: RecommendationReason
}

export async function getRecommendations(): Promise<RecommendationResponse> {
  const res = await fetch(`${PYTHON_URL}/api/recommendations`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}