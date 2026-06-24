const API_URL = import.meta.env.VITE_API_URL

export interface UserResponse {
  id:        string
  username:  string
  email:     string
  createdAt: string
}

export interface UpdateUserRequest {
  username?:        string
  currentPassword?: string
  newPassword?:     string
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function errorBody(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.message || res.statusText
  } catch {
    return res.statusText
  }
}

export async function getUser(): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/api/user`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
  return res.json()
}

export async function updateUser(payload: UpdateUserRequest): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/api/user`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  if (res.status === 401) throw new Error('wrong_password')
  if (res.status === 409) throw new Error('username_taken')
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
  return res.json()
}

export async function deleteUser(): Promise<void> {
  const res = await fetch(`${API_URL}/api/user`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await errorBody(res)}`)
}