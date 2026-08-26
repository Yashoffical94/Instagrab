/**
 * error.middleware.js
 * Global error handling middleware.
 * Catches all unhandled errors and returns safe, user-friendly responses.
 * Never exposes internal error details in production.
 */

/**
 * Global error handler - catches all errors in the application
 * @param {Error} err - Error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorMiddleware(err, req, res, next) {
  // Log the error for server-side debugging
  console.error('=== Error ===')
  console.error('Timestamp:', new Date().toISOString())
  console.error('Path:', req.path)
  console.error('Method:', req.method)
  console.error('Message:', err.message)

  // Log stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack)
  }

  // Determine status code
  let statusCode = err.statusCode || err.status || 500

  // Map error codes to HTTP status
  const codeMap = {
    'INVALID_URL': 400,
    'MISSING_URL': 400,
    'PRIVATE_ACCOUNT': 403,
    'CONTENT_NOT_FOUND': 404,
    'RATE_LIMITED': 429,
    'EXTRACTION_FAILED': 500,
    'TIMEOUT': 408,
  }

  if (err.code && codeMap[err.code]) {
    statusCode = codeMap[err.code]
  }

  // Build error response
  const isDev = process.env.NODE_ENV === 'development'

  const response = {
    success: false,
    error: isDev
      ? err.message
      : getSafeErrorMessage(statusCode),
    code: err.code || 'INTERNAL_ERROR',
  }

  // Include additional details in development
  if (isDev) {
    response.stack = err.stack?.split('\n').slice(0, 5)
    response.timestamp = new Date().toISOString()
  }

  res.status(statusCode).json(response)
}

/**
 * Get a safe error message for production (never expose internals)
 * @param {number} statusCode - HTTP status code
 * @returns {string} User-friendly error message
 */
function getSafeErrorMessage(statusCode) {
  const messages = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required.',
    403: 'Access denied. This content may be from a private account.',
    404: 'Content not found. It may have been deleted or is unavailable.',
    408: 'Request timed out. Please try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Something went wrong on our end. Please try again later.',
    502: 'Service temporarily unavailable. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
  }

  return messages[statusCode] || 'An unexpected error occurred. Please try again.'
}
