const API_BASE = '/api'

export function buildQuery(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v)
  })
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export async function request(path, { method = 'GET', headers, body } = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  })

  if (!res.ok) {
    let errText = `${res.status} ${res.statusText}`
    try {
      const errJson = await res.json()
      errText = errJson.error || errJson.message || JSON.stringify(errJson)
    } catch {
      //
    }
    throw new Error(errText)
  }

  if (res.status === 204) return null
  return res.json()
}

export async function requestGuest(path, { method = 'GET', headers, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  })

  if (!res.ok) {
    let errText = `${res.status} ${res.statusText}`
    try {
      const errJson = await res.json()
      errText = errJson.error || errJson.message || JSON.stringify(errJson)
    } catch {
      //
    }
    throw new Error(errText)
  }

  if (res.status === 204) return null
  return res.json()
}
