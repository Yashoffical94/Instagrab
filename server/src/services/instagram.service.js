/**
 * instagram.service.js
 * Core service for extracting Instagram media using yt-dlp.
 * Handles posts, reels, carousels, stories, and IGTV content.
 */

import ytDlpWrapModule from 'yt-dlp-wrap'
const YTDlpWrap = ytDlpWrapModule.default || ytDlpWrapModule
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Instagram Media Extraction Service
 * Uses yt-dlp to extract media information from Instagram URLs.
 */
export class InstagramService {
  constructor() {
    this.ytdlp = null
    this.ytdlpPath = null
    this.initYtdlp()
  }

  /**
   * Initialize yt-dlp binary path
   * Uses environment variable, auto-download, or system PATH
   */
  initYtdlp() {
    try {
      // Check for environment-specified path
      if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
        this.ytdlpPath = process.env.YTDLP_PATH
        this.ytdlp = new YTDlpWrap(this.ytdlpPath)
        console.log('[InstagramService] Using yt-dlp from:', this.ytdlpPath)
        return
      }

      // Check if yt-dlp is available in system PATH
      try {
        execSync('yt-dlp --version', { stdio: 'ignore' })
        this.ytdlp = new YTDlpWrap('yt-dlp')
        console.log('[InstagramService] Using system yt-dlp')
        return
      } catch {
        // Not in PATH, will auto-download
      }

      // Check for locally downloaded binary
      const localBinDir = join(__dirname, '..', '..', 'bin')
      const localBinPath = join(localBinDir, 'yt-dlp')

      if (fs.existsSync(localBinPath)) {
        fs.chmodSync(localBinPath, '755')
        this.ytdlpPath = localBinPath
        this.ytdlp = new YTDlpWrap(localBinPath)
        console.log('[InstagramService] Using local yt-dlp:', localBinPath)
        return
      }

      // Auto-download yt-dlp binary
      console.log('[InstagramService] Auto-downloading yt-dlp...')
      this.ytdlp = new YTDlpWrap()
    } catch (error) {
      console.error('[InstagramService] Failed to initialize yt-dlp:', error.message)
      throw new Error('Failed to initialize media extraction service')
    }
  }

  /**
   * Determine the content type from the URL
   * @param {string} url - Instagram URL
   * @returns {string} Content type (video, image, carousel, story, reel, igtv)
   */
  detectContentType(url) {
    const lower = url.toLowerCase()
    if (lower.includes('/reel/') || lower.includes('/reels/')) return 'reel'
    if (lower.includes('/tv/') || lower.includes('/igtv/')) return 'igtv'
    if (lower.includes('/stories/')) return 'story'
    if (lower.includes('/p/') || lower.includes('/share/p/')) return 'post'
    return 'post' // default
  }

  /**
   * Extract media information from an Instagram URL
   * @param {string} url - Instagram URL
   * @returns {Promise<object>} Media information including type, thumbnail, caption, and download URLs
   */
  async extractMedia(url) {
    if (!this.ytdlp) {
      throw new Error('Media extraction service not initialized')
    }

    try {
      // Extract info using yt-dlp
      const metadata = await this.getMetadata(url)

      // Process the metadata into our response format
      return this.processMetadata(metadata, url)

    } catch (error) {
      // Classify errors for better frontend handling
      this.classifyError(error)
      throw error
    }
  }

  /**
   * Get metadata from yt-dlp
   * @param {string} url - Instagram URL
   * @returns {Promise<object>} Raw yt-dlp metadata
   */
  async getMetadata(url) {
    const options = [
      // General options
      '--no-warnings',
      '--no-check-certificates',
      '--skip-download',
      // Network options
      '--user-agent', process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0',
      // Output format: JSON
      '--dump-json',
      // Don't download subtitles or thumbnails as files
      '--no-write-subs',
      '--no-write-thumbnail',
      // Allow unplayable formats (for extraction)
      '--allow-unplayable-formats',
      // Retries
      '--retries', '3',
      '--fragment-retries', '3',
      // Socket timeout
      '--socket-timeout', '30',
    ]

    // yt-dlp-wrap getVideoInfo returns parsed JSON
    try {
      const metadata = await this.ytdlp.getVideoInfo(url, options)
      return metadata
    } catch (error) {
      throw this.wrapError(error, 'EXTRACTION_FAILED')
    }
  }

  /**
   * Process raw yt-dlp metadata into our API response format
   * @param {object|Array} metadata - Raw yt-dlp metadata
   * @param {string} originalUrl - Original Instagram URL
   * @returns {object} Processed media information
   */
  processMetadata(metadata, originalUrl) {
    // yt-dlp may return an array for carousels or single object for single media
    const entries = Array.isArray(metadata) ? metadata : [metadata]

    if (!entries.length) {
      throw new Error('No media found in the provided URL')
    }

    // Use the first entry as primary for thumbnail/caption
    const primary = entries[0]

    // Extract caption/description
    const caption = this.extractCaption(primary)

    // Extract thumbnail
    const thumbnail = this.extractThumbnail(primary)

    // Extract username
    const username = this.extractUsername(primary, originalUrl)

    // Process media entries
    const media = entries.flatMap((entry) => this.processEntry(entry))

    // Determine content type
    const contentType = this.determineMediaType(media, originalUrl)

    return {
      type: contentType,
      thumbnail,
      caption,
      username,
      media,
    }
  }

  /**
   * Extract caption from metadata
   * @param {object} entry - yt-dlp entry
   * @returns {string|null} Caption text
   */
  extractCaption(entry) {
    // Try multiple fields where caption might be stored
    const caption = entry.description
      || entry.title
      || entry.alt_title
      || (entry.entries && entry.entries[0] && entry.entries[0].description)
      || null

    // Clean up caption - remove URLs and excessive whitespace
    if (caption && typeof caption === 'string') {
      return caption.trim() || null
    }
    return null
  }

  /**
   * Extract thumbnail URL from metadata
   * @param {object} entry - yt-dlp entry
   * @returns {string|null} Thumbnail URL
   */
  extractThumbnail(entry) {
    // Try multiple thumbnail sources
    return entry.thumbnail
      || (entry.thumbnails && entry.thumbnails.length > 0
        ? entry.thumbnails[entry.thumbnails.length - 1].url // highest quality
        : null)
      || (entry.entries && entry.entries[0] && entry.entries[0].thumbnail)
      || null
  }

  /**
   * Extract username from metadata or URL
   * @param {object} entry - yt-dlp entry
   * @param {string} url - Instagram URL
   * @returns {string|null} Username
   */
  extractUsername(entry, url) {
    // Try uploader field
    if (entry.uploader && entry.uploader !== 'Unknown') {
      return entry.uploader.replace('@', '')
    }

    // Try extractor-specific data
    if (entry.uploader_id) {
      return entry.uploader_id
    }

    // Extract from URL patterns
    const match = url.match(/instagram\.com\/([^/]+)/)
    if (match && match[1] && !['p', 'reel', 'reels', 'tv', 'stories', 'share'].includes(match[1])) {
      return match[1]
    }

    return null
  }

  /**
   * Process a single yt-dlp entry into media items
   * @param {object} entry - Single yt-dlp entry
   * @returns {Array} Array of media items
   */
  processEntry(entry) {
    const items = []

    // Handle nested entries (carousels)
    if (entry.entries && Array.isArray(entry.entries)) {
      for (const subEntry of entry.entries) {
        items.push(...this.processEntry(subEntry))
      }
      return items
    }

    // Get best format for download
    const format = this.getBestFormat(entry)

    if (!format) {
      return items
    }

    // Determine if video or image
    const isVideo = this.isVideoFormat(entry, format)

    items.push({
      type: isVideo ? 'video' : 'image',
      url: format.url,
      // For video: also provide direct download URL
      downloadUrl: format.url,
      quality: format.quality || format.resolution || 'unknown',
      ext: format.ext || (isVideo ? 'mp4' : 'jpg'),
      width: format.width || entry.width || null,
      height: format.height || entry.height || null,
      filesize: format.filesize || format.filesize_approx || null,
    })

    return items
  }

  /**
   * Get the best available format from an entry
   * @param {object} entry - yt-dlp entry
   * @returns {object|null} Best format object
   */
  getBestFormat(entry) {
    // If we have a direct URL, use it
    if (entry.url) {
      return {
        url: entry.url,
        quality: entry.quality,
        ext: entry.ext,
        width: entry.width,
        height: entry.height,
        filesize: entry.filesize,
        filesize_approx: entry.filesize_approx,
      }
    }

    // Check formats array
    if (!entry.formats || !Array.isArray(entry.formats) || entry.formats.length === 0) {
      return null
    }

    // Filter for downloadable formats
    let formats = entry.formats.filter(f => {
      // Must have a URL
      if (!f.url) return false
      // Skip manifest-based formats (HLS/DASH)
      if (f.protocol && (f.protocol.includes('m3u') || f.protocol.includes('dash'))) return false
      return true
    })

    if (formats.length === 0) {
      // Fallback: try any format with a URL
      formats = entry.formats.filter(f => f.url)
    }

    if (formats.length === 0) {
      return null
    }

    // Sort by quality (prefer higher resolution)
    formats.sort((a, b) => {
      const aQuality = (a.height || 0) * (a.width || 0)
      const bQuality = (b.height || 0) * (b.width || 0)
      return bQuality - aQuality
    })

    // Return the best format
    const best = formats[0]
    return {
      url: best.url,
      quality: best.quality || best.format_note,
      ext: best.ext || entry.ext,
      width: best.width,
      height: best.height,
      filesize: best.filesize,
      filesize_approx: best.filesize_approx,
    }
  }

  /**
   * Determine if a format is video or image
   * @param {object} entry - yt-dlp entry
   * @param {object} format - Format object
   * @returns {boolean} True if video
   */
  isVideoFormat(entry, format) {
    // Check explicit indicators
    if (entry.vcodec && entry.vcodec !== 'none') return true
    if (entry.ext === 'mp4') return true
    if (format.ext === 'mp4') return true

    // Check for audio (if it has audio, it's a video)
    if (entry.acodec && entry.acodec !== 'none') return true

    // Duration > 0 indicates video
    if (entry.duration && entry.duration > 0) return true

    // Check format note
    if (format.quality && typeof format.quality === 'string') {
      if (format.quality.includes('video')) return true
    }

    // Default to image for unknown
    return false
  }

  /**
   * Determine the overall media type from collected items
   * @param {Array} media - Processed media items
   * @param {string} url - Original URL
   * @returns {string} Content type label
   */
  determineMediaType(media, url) {
    const urlType = this.detectContentType(url)

    if (media.length > 1) return 'carousel'
    if (media.length === 0) return urlType

    const item = media[0]
    if (item.type === 'video') {
      if (urlType === 'reel') return 'reel'
      if (urlType === 'igtv') return 'igtv'
      if (urlType === 'story') return 'story'
      return 'video'
    }

    return 'image'
  }

  /**
   * Classify errors for appropriate HTTP responses
   * @param {Error} error - Raw error
   */
  classifyError(error) {
    const message = error.message || ''
    const stderr = error.stderr || ''
    const combined = `${message} ${stderr}`.toLowerCase()

    if (combined.includes('private') || combined.includes('login') || combined.includes('sign in')) {
      error.code = 'PRIVATE_ACCOUNT'
    } else if (combined.includes('not found') || combined.includes('deleted') || combined.includes('unavailable') || combined.includes('404')) {
      error.code = 'CONTENT_NOT_FOUND'
    } else if (combined.includes('rate') || combined.includes('429') || combined.includes('too many requests')) {
      error.code = 'RATE_LIMITED'
    } else {
      error.code = 'EXTRACTION_FAILED'
    }
  }

  /**
   * Wrap an error with additional context
   * @param {Error} error - Original error
   * @param {string} code - Error code
   * @returns {Error} Wrapped error
   */
  wrapError(error, code) {
    error.code = code
    return error
  }
}
