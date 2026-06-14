import type {
  CollectionEntryResponse,
  CreateMediaItemRequest,
  AddToCollectionRequest,
  UpdateCollectionEntryRequest,
  MediaItemResponse,
} from '../types'
import { toBackendStatus } from '../utils/status'

const API_URL = import.meta.env.VITE_API_URL

// Lee el token de donde lo hayamos guardado (localStorage o sessionStorage)
function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Lee el cuerpo de una respuesta de error para incluirlo en el mensaje.
async function errorBody(res: Response): Promise<string> {
  try {
    const text = await res.text()
    return text || res.statusText
  } catch {
    return res.statusText
  }
}

export async function getCollection(): Promise<CollectionEntryResponse[]> {
  const res = await fetch(`${API_URL}/api/collection`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
  return res.json()
}

export async function addToCollection(
  payload: AddToCollectionRequest,
): Promise<CollectionEntryResponse> {
  const body = { ...payload, status: toBackendStatus(payload.status) }
  const res = await fetch(`${API_URL}/api/collection`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  // 409 Conflict significa que el ítem ya está en la colección
  if (res.status === 409) throw new Error('already_in_collection')
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
  return res.json()
}

export async function updateCollectionEntry(
  id: string,
  payload: UpdateCollectionEntryRequest,
): Promise<CollectionEntryResponse> {
  const body = {
    ...payload,
    status: payload.status ? toBackendStatus(payload.status) : undefined,
  }
  const res = await fetch(`${API_URL}/api/collection/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
  return res.json()
}

export async function deleteFromCollection(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/collection/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
}

export async function createMediaItem(
  payload: CreateMediaItemRequest,
): Promise<MediaItemResponse> {
  const res = await fetch(`${API_URL}/api/media`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
  return res.json()
}