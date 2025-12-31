// src/lib/services/api.ts
/**
 * Utility functions for API calls
 */

export const apiCall = async (
  url: string,
  options: RequestInit = {}
) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

export const get = (url: string) =>
  apiCall(url, { method: 'GET' })

export const post = (url: string, data: any) =>
  apiCall(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const put = (url: string, data: any) =>
  apiCall(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

export const del = (url: string) =>
  apiCall(url, { method: 'DELETE' })
