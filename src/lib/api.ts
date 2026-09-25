/**
 * api.ts
 * Axios API client configuration for InstaGrab.
 * Handles requests to the backend server with proper error handling.
 */

import axios from 'axios'

// Base URL for the API
// In development, Vite proxy handles the forwarding
// In production, set VITE_API_URL to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for media extraction
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add any auth tokens or headers here
apiClient.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        error: 'Network error. Please check your connection or try again later.',
        code: 'NETWORK_ERROR',
      })
    }

    // Handle API error responses
    const { data, status } = error.response

    // Return the error data from the server if available
    if (data && typeof data === 'object') {
      return Promise.reject(data)
    }

    // Generic HTTP error
    return Promise.reject({
      success: false,
      error: getErrorMessage(status),
      code: `HTTP_${status}`,
      status,
    })
  }
)

/**
 * Get a user-friendly error message from HTTP status code
 */
function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your URL and try again.',
    403: 'This content is from a private account and cannot be accessed.',
    404: 'Content not found. It may have been deleted or is unavailable.',
    408: 'Request timed out. Please try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
  }
  return messages[status] || 'An unexpected error occurred. Please try again.'
}

/**
 * API response type for media extraction
 */
export interface MediaItem {
  type: 'video' | 'image'
  url: string
  downloadUrl: string
  quality: string
  ext: string
  width: number | null
  height: number | null
  filesize: number | null
}

export interface DownloadResponse {
  success: boolean
  type: string
  thumbnail: string | null
  caption: string | null
  username: string | null
  media: MediaItem[]
}

export interface ApiError {
  success: false
  error: string
  code: string
  status?: number
}

/**
 * Type guard to check whether an unknown thrown value is an ApiError
 */
export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as { error: unknown }).error === 'string'
  )
}

/**
 * Send a download request to the backend
 * @param url - Instagram URL to process
 * @returns Promise with download response
 */
export async function downloadMedia(url: string): Promise<DownloadResponse> {
  const response = await apiClient.post<DownloadResponse>('/api/download', { url })
  return response.data
}

/**
 * Check backend health status
 * @returns Promise with health status
 */
export async function checkHealth(): Promise<{ success: boolean; status: string }> {
  const response = await apiClient.get('/api/health')
  return response.data
}

export default apiClient
