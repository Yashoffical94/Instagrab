/**
 * download.controller.js
 * Controller for handling Instagram download requests.
 * Validates input, calls the Instagram service, and returns media data.
 */

import { InstagramService } from '../services/instagram.service.js'
import { validateInstagramUrl } from '../utils/validators.js'

// Singleton instance of the Instagram service
const instagramService = new InstagramService()

/**
 * POST /api/download
 * Main download controller - extracts media from an Instagram URL.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function downloadController(req, res, next) {
  const startTime = Date.now()

  try {
    // Extract URL from request body
    const { url } = req.body

    // Validate URL presence
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'URL is required. Please provide an Instagram URL.',
        code: 'MISSING_URL',
      })
    }

    // Validate URL format
    const trimmedUrl = url.trim()
    if (!validateInstagramUrl(trimmedUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Instagram URL. Supported formats: posts, reels, stories, carousels, IGTV.',
        code: 'INVALID_URL',
      })
    }

    // Extract media information using yt-dlp
    const result = await instagramService.extractMedia(trimmedUrl)

    // Log success (in production, use a proper logger)
    const duration = Date.now() - startTime
    console.log(`[${new Date().toISOString()}] Download success: ${trimmedUrl.substring(0, 60)}... (${duration}ms)`)

    // Return successful response
    return res.status(200).json({
      success: true,
      ...result,
    })

  } catch (error) {
    // Log error for monitoring
    console.error(`[${new Date().toISOString()}] Download error:`, error.message)

    // Handle specific error types
    if (error.code === 'PRIVATE_ACCOUNT') {
      return res.status(403).json({
        success: false,
        error: 'This content is from a private account and cannot be accessed.',
        code: 'PRIVATE_ACCOUNT',
      })
    }

    if (error.code === 'CONTENT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: 'Content not found. The post may have been deleted or is unavailable.',
        code: 'CONTENT_NOT_FOUND',
      })
    }

    if (error.code === 'RATE_LIMITED') {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMITED',
      })
    }

    // Pass unknown errors to the global error handler
    next(error)
  }
}
