import type {
  CollectionEntryResponse,
  CreateMediaItemRequest,
  AddToCollectionRequest,
  UpdateCollectionEntryRequest,
  MediaItemResponse,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL

// Read token from localStorage or sessionStorage
function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function getCollection(): Promise<CollectionEntryResponse[]> {
  const res = await fetch(`${API_URL}/api/collection`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function addToCollection(
  payload: AddToCollectionRequest,
): Promise<CollectionEntryResponse> {
  const res = await fetch(`${API_URL}/api/collection`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  // 409 Conflict : item already in collection
  if (res.status === 409) throw new Error('already_in_collection')
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function updateCollectionEntry(
  id: string,
  payload: UpdateCollectionEntryRequest,
): Promise<CollectionEntryResponse> {
  const res = await fetch(`${API_URL}/api/collection/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function deleteFromCollection(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/collection/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
}

export async function createMediaItem(
  payload: CreateMediaItemRequest,
): Promise<MediaItemResponse> {
  const res = await fetch(`${API_URL}/api/media`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}