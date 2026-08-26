/**
 * app.js
 * Express application factory.
 * Configures all middleware, routes, and error handling.
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimitMiddleware } from './middleware/rateLimit.middleware.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import downloadRoutes from './routes/download.routes.js'

/**
 * Creates and configures the Express application
 * @returns {express.Application} Configured Express app
 */
export function createApp() {
  const app = express()

  // ============================================
  // Security Middleware
  // ============================================

  // Helmet: sets security headers (CSP, HSTS, X-Frame-Options, etc.)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        mediaSrc: ["'self'", "https:", "blob:"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }))

  // CORS: allow requests from configured origins
  const corsOrigins = process.env.CORS_ORIGINS || '*'
  const corsOptions = {
    origin: corsOrigins === '*'
      ? true
      : corsOrigins.split(',').map(o => o.trim()),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // 24 hours
  }
  app.use(cors(corsOptions))

  // Rate limiting: prevent abuse and spam
  app.use(rateLimitMiddleware)

  // ============================================
  // Body Parsing
  // ============================================

  // Parse JSON request bodies (max 10KB for URL input)
  app.use(express.json({ limit: '10kb' }))

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10kb' }))

  // ============================================
  // Request Timeout
  // ============================================

  const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10)
  app.use((req, res, next) => {
    req.setTimeout(requestTimeout, () => {
      res.status(408).json({
        success: false,
        error: 'Request timeout. Please try again.',
      })
    })
    next()
  })

  // ============================================
  // API Routes
  // ============================================

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  })

  // Download routes (main API)
  app.use('/api', downloadRoutes)

  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'InstaGrab API Server',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        download: '/api/download (POST)',
      },
    })
  })

  // ============================================
  // Error Handling
  // ============================================

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.path,
    })
  })

  // Global error handler
  app.use(errorMiddleware)

  return app
}
