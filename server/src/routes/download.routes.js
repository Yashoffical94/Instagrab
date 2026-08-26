/**
 * download.routes.js
 * Routes for the Instagram download API.
 * Handles POST /api/download for media extraction.
 */

import { Router } from 'express'
import { downloadController } from '../controllers/download.controller.js'

const router = Router()

/**
 * POST /api/download
 * Extracts media information from an Instagram URL.
 * 
 * Request body:
 *   { url: "https://www.instagram.com/reel/..." }
 * 
 * Response:
 *   { success: true, type: "video", thumbnail: "...", caption: "...", media: [...] }
 */
router.post('/download', downloadController)

export default router
