# InstaGrab Backend API

Production-ready Node.js/Express backend for Instagram content downloading using yt-dlp.

## Features

- **Instagram Media Extraction** via yt-dlp (posts, reels, carousels, stories, IGTV)
- **Express.js REST API** with clean architecture
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Safe error messages, no internal data leaks
- **Modular Structure**: Routes, Controllers, Services, Middleware separation

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime |
| Express.js | Web framework |
| yt-dlp-wrap | Instagram media extraction |
| express-rate-limit | Rate limiting |
| helmet | Security headers |
| cors | Cross-origin requests |
| dotenv | Environment configuration |

## Quick Start

### Prerequisites

- **Node.js** 18+ (`node --version`)
- **yt-dlp** binary (auto-downloaded on first run, or install manually)
- **ffmpeg** (recommended for video processing)

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server starts on port 5000 by default.

### 4. Verify

```bash
curl http://localhost:5000/api/health
```

## API Endpoints

### POST /api/download

Extract media from an Instagram URL.

**Request:**
```bash
curl -X POST http://localhost:5000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/reel/ABC123/"}'
```

**Response:**
```json
{
  "success": true,
  "type": "reel",
  "thumbnail": "https://...",
  "caption": "Post caption text...",
  "username": "creator_username",
  "media": [
    {
      "type": "video",
      "url": "https://direct-url-to-media...",
      "downloadUrl": "https://direct-url-to-media...",
      "quality": "1080p",
      "ext": "mp4",
      "width": 1080,
      "height": 1920,
      "filesize": 5242880
    }
  ]
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1234.56
}
```

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| MISSING_URL | 400 | URL parameter not provided |
| INVALID_URL | 400 | URL format is not valid Instagram |
| PRIVATE_ACCOUNT | 403 | Content is from a private account |
| CONTENT_NOT_FOUND | 404 | Post deleted or unavailable |
| RATE_LIMITED | 429 | Too many requests from yt-dlp |
| RATE_LIMIT_EXCEEDED | 429 | API rate limit exceeded |
| DOWNLOAD_LIMIT_EXCEEDED | 429 | Download rate limit exceeded |
| EXTRACTION_FAILED | 500 | yt-dlp extraction error |

## Project Structure

```
server/
├── src/
│   ├── routes/
│   │   └── download.routes.js       # Route definitions
│   ├── controllers/
│   │   └── download.controller.js   # Request/response handling
│   ├── services/
│   │   └── instagram.service.js     # yt-dlp media extraction logic
│   ├── middleware/
│   │   ├── error.middleware.js      # Global error handler
│   │   └── rateLimit.middleware.js  # Rate limiting config
│   ├── utils/
│   │   └── validators.js            # URL validation & sanitization
│   ├── app.js                       # Express app configuration
│   └── server.js                    # Entry point
├── .env.example                     # Environment template
└── package.json
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment mode |
| CORS_ORIGINS | * | Allowed origins (comma-separated) |
| RATE_LIMIT_MAX | 30 | Max requests per window |
| RATE_LIMIT_WINDOW | 15 | Rate limit window (minutes) |
| REQUEST_TIMEOUT | 30000 | Request timeout (ms) |
| YTDLP_PATH | (auto) | Path to yt-dlp binary |
| USER_AGENT | (default) | User agent string |

## yt-dlp Installation

### Automatic (Recommended)

`yt-dlp-wrap` auto-downloads the binary on first run. No manual setup needed.

### Manual Installation

**macOS (Homebrew):**
```bash
brew install yt-dlp
```

**Ubuntu/Debian:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**CentOS/RHEL/Fedora:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**Windows (winget):**
```bash
winget install yt-dlp
```

### Update yt-dlp

```bash
yt-dlp -U
```

## ffmpeg Installation (Recommended)

ffmpeg is recommended for video processing but not strictly required.

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**CentOS/RHEL:**
```bash
sudo yum install ffmpeg
```

## Deployment

### Render.com

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: (leave empty or set to project root)
4. Add environment variables in the Render dashboard
5. Deploy

**render.yaml (optional, for infrastructure-as-code):**
```yaml
services:
  - type: web
    name: instagrab-api
    runtime: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: RATE_LIMIT_MAX
        value: 50
```

### Railway

The backend deploys automatically to Railway on every push to `main`.

**Setup (already configured):**

1. Railway service connected to GitHub repo `Yashoffical94/Instagrab`, branch `main`
2. **Root directory:** `server` (only the backend is built/deployed)
3. **Builder:** Dockerfile (`server/Dockerfile` — includes Node 18 + yt-dlp)
4. **Health check:** `/api/health`

**Environment variables:**

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | `https://instagrab-gray.vercel.app` |

**Manual deploy (fallback):**

```bash
cd server
railway up
```

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "deploy": {
    "startCommand": "node src/server.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 10,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### VPS (Ubuntu)

**1. Connect to your server:**
```bash
ssh user@your-server-ip
```

**2. Install Node.js 18+:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**3. Install yt-dlp:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**4. Install ffmpeg:**
```bash
sudo apt update
sudo apt install -y ffmpeg
```

**5. Clone and setup:**
```bash
git clone <your-repo> instagrab
cd instagrab/server
cp .env.example .env
# Edit .env with production settings
npm install --production
```

**6. Setup PM2 (process manager):**
```bash
sudo npm install -g pm2
pm2 start src/server.js --name instagrab-api
pm2 startup
pm2 save
```

**7. Setup Nginx reverse proxy:**
```bash
sudo apt install nginx
```

Create `/etc/nginx/sites-available/instagrab`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/instagrab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**8. Setup SSL (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## Frontend Integration

The frontend proxies `/api` requests to the backend during development:

```javascript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

For production, set the `VITE_API_URL` environment variable:

```bash
VITE_API_URL=https://api.yourdomain.com
```

## Security Considerations

- All user inputs are validated and sanitized
- Rate limiting prevents abuse (30 requests/15 min default)
- Security headers via Helmet
- CORS configured for specific origins in production
- Error messages never expose internal details
- Download URLs are validated before serving

## License

MIT
