const API_URL = import.meta.env.VITE_API_URL

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/admin/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Session expired. Please login again.')
  }

  return data
}

export async function apiRequest(endpoint, options = {}) {
  const requestOptions = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    },
  }

  let response = await fetch(`${API_URL}${endpoint}`, requestOptions)

  const isPublicEndpoint =
    endpoint === '/notices' ||
    endpoint === '/admissions' ||
    endpoint === '/admissions/check-status' ||
    endpoint === '/admin/login' ||
    endpoint === '/admin/refresh'

  if (response.status === 401 && !isPublicEndpoint) {
    try {
      await refreshAccessToken()
      response = await fetch(`${API_URL}${endpoint}`, requestOptions)
    } catch (error) {
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.replace('/admin/login')
      }

      throw error
    }
  }

  return parseResponse(response)
}