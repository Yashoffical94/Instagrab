/**
 * validators.js
 * Input validation utilities for the InstaGrab API.
 * Ensures URLs and other inputs are safe and valid before processing.
 */

/**
 * Validate an Instagram URL
 * Checks if the URL matches known Instagram content patterns.
 * 
 * Supported formats:
 * - Posts: /p/SHORTCODE or /share/p/SHORTCODE
 * - Reels: /reel/SHORTCODE or /reels/SHORTCODE
 * - Stories: /stories/USERNAME/STORY_ID
 * - IGTV: /tv/SHORTCODE
 * - Short URLs: instagr.am/p/SHORTCODE
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Instagram content URL
 */
export function validateInstagramUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmed = url.trim()

  // Basic URL format check
  try {
    new URL(trimmed)
  } catch {
    return false
  }

  // Instagram domain patterns
  const instagramPatterns = [
    // Posts (most common)
    /^https?:\/\/([\w-]+\.)?instagram\.com\/p\/[\w-]+/i,
    // Shared posts
    /^https?:\/\/([\w-]+\.)?instagram\.com\/share\/p\/[\w-]+/i,
    // Reels
    /^https?:\/\/([\w-]+\.)?instagram\.com\/reel(s)?\/[\w-]+/i,
    // IGTV
    /^https?:\/\/([\w-]+\.)?instagram\.com\/tv\/[\w-]+/i,
    // Stories
    /^https?:\/\/([\w-]+\.)?instagram\.com\/stories\/[\w-]+/i,
    // Short URLs
    /^https?:\/\/instagr\.am\/p\/[\w-]+/i,
    // Reel share
    /^https?:\/\/([\w-]+\.)?instagram\.com\/share\/reel\/[\w-]+/i,
  ]

  return instagramPatterns.some(pattern => pattern.test(trimmed))
}

/**
 * Sanitize a URL string
 * Removes potentially dangerous characters and normalizes the URL
 * 
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return ''
  }

  return url
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
}

/**
 * Validate and sanitize a download URL
 * Ensures the URL is safe for redirect/download
 * 
 * @param {string} url - Download URL to validate
 * @returns {boolean} True if safe
 */
export function isSafeDownloadUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    const parsed = new URL(url)

    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }

    // Must have a valid hostname
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return false
    }

    // Block localhost and private IPs
    const hostname = parsed.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Check if input contains potential injection patterns
 * Basic check for common attack vectors
 * 
 * @param {string} input - Input string to check
 * @returns {boolean} True if input appears safe
 */
export function isSafeInput(input) {
  if (!input || typeof input !== 'string') {
    return false
  }

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /\$\{/,
    /<%/,
    /\bexec\s*\(/i,
    /\beval\s*\(/i,
    /\bsystem\s*\(/i,
  ]

  return !dangerousPatterns.some(pattern => pattern.test(input))
}
