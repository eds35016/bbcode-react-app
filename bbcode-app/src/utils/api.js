const API_URL = '/api'

function getToken() {
  return localStorage.getItem('token')
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  localStorage.setItem('token', data.token)
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error('Register failed')
  const data = await res.json()
  localStorage.setItem('token', data.token)
}

async function authFetch(url, options = {}) {
  const token = getToken()
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) throw new Error('Unauthorized')
  return res
}

export async function loadTemplates() {
  const res = await authFetch(`${API_URL}/templates`)
  if (!res.ok) throw new Error('Failed to load')
  return res.json()
}

export async function loadTemplate(id) {
  const res = await authFetch(`${API_URL}/templates/${id}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export async function saveTemplate(template) {
  if (template.id) {
    const res = await authFetch(`${API_URL}/templates/${template.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    })
    if (!res.ok) throw new Error('Failed to save')
    return res.json()
  } else {
    const res = await authFetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    })
    if (!res.ok) throw new Error('Failed to save')
    return res.json()
  }
}

export async function shareTemplate(id) {
  const res = await authFetch(`${API_URL}/templates/${id}/share`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to share')
  return res.json()
}

export async function loadSharedTemplate(shareId) {
  const res = await fetch(`${API_URL}/share/${shareId}`)
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export function logout() {
  localStorage.removeItem('token')
}

export function isLoggedIn() {
  return !!getToken()
}
