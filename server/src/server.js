/**
 * server.js
 * Entry point for the InstaGrab API server.
 * Loads environment variables and starts the Express application.
 */

import dotenv from 'dotenv'
import { createApp } from './app.js'

// Load environment variables from .env file
dotenv.config()

// Get port from environment or default to 5000
const PORT = parseInt(process.env.PORT || '5000', 10)

// Create the Express application
const app = createApp()

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`InstaGrab API Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
