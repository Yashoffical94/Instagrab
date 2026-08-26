/**
 * rateLimit.middleware.js
 * Rate limiting middleware to prevent abuse and ensure fair usage.
 * Limits requests per IP address within a time window.
 */

import rateLimit from 'express-rate-limit'

// Get configuration from environment variables
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '30', 10)
const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10)
const windowMs = windowMinutes * 60 * 1000

/**
 * Rate limiter middleware instance
 * Configured based on environment variables
 */
export const rateLimitMiddleware = rateLimit({
  // Time window in milliseconds
  windowMs: windowMs,

  // Maximum number of requests per window per IP
  max: maxRequests,

  // Return rate limit info in the `RateLimit-*` headers
  standardHeaders: true,

  // Disable the `X-RateLimit-*` headers (deprecated)
  legacyHeaders: false,

  // Use IP address as key (can be customized for proxies)
  keyGenerator: (req) => {
    // Trust X-Forwarded-For header if behind a proxy
    const forwarded = req.headers['x-forwarded-for']
    if (forwarded) {
      const ips = forwarded.split(',').map(ip => ip.trim())
      return ips[0] // First IP is the client
    }
    return req.ip
  },

  // Skip successful requests from counting (health check)
  skip: (req) => {
    return req.path === '/api/health'
  },

  // Handler when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000),
    })
  },

  // Custom message for when max is exceeded
  message: {
    success: false,
    error: 'Rate limit exceeded. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
})

// Stricter rate limiter for the download endpoint (more expensive operation)
export const downloadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 downloads per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for']
    if (forwarded) {
      const ips = forwarded.split(',').map(ip => ip.trim())
      return ips[0]
    }
    return req.ip
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Download limit reached. Please wait 10 minutes and try again.',
      code: 'DOWNLOAD_LIMIT_EXCEEDED',
      retryAfter: 600,
    })
  },
})
