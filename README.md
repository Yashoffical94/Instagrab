# InstaGrab

A premium, full-stack Instagram content downloader built with React + TypeScript + Vite (frontend) and Node.js + Express + yt-dlp (backend). Features a stunning WebGL fluid gradient shader background, glassmorphism UI, and real media extraction.

## Architecture

```
InstaGrab/
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── FluidGradient.tsx    # WebGL shader background
│   │   │   ├── Navigation.tsx       # Top nav bar
│   │   │   ├── DownloaderCard.tsx   # Main downloader (API integrated)
│   │   │   └── ...
│   │   ├── sections/               # Page sections
│   │   ├── pages/                  # Route pages
│   │   ├── lib/
│   │   │   └── api.ts              # Axios API client
│   │   └── ...
│   └── .env                        # Frontend env config
│
├── Backend (Express + yt-dlp)
│   └── server/
│       ├── src/
│       │   ├── routes/
│       │   │   └── download.routes.js
│       │   ├── controllers/
│       │   │   └── download.controller.js
│       │   ├── services/
│       │   │   └── instagram.service.js   # yt-dlp extraction
│       │   ├── middleware/
│       │   │   ├── error.middleware.js
│       │   │   └── rateLimit.middleware.js
│       │   ├── utils/
│       │   │   └── validators.js
│       │   ├── app.js
│       │   └── server.js
│       ├── .env.example
│       └── package.json
│
└── design/
    └── design.md                    # Design PRD
```

## Features

### Frontend
- **WebGL Fluid Gradient Shader** — Organic, morphing violet-to-magenta gradient with mouse interactivity
- **Glassmorphism Downloader Card** — Paste URL, get media with thumbnail preview
- **Real-time API Integration** — Full Axios integration with the backend
- **Thumbnail Preview** — Shows content preview before downloading
- **Carousel Support** — Lists all carousel items with individual download buttons
- **Download All** — One-click download all carousel items
- **Animated States** — Loading spinner, success checkmark, error alerts
- **Server Health Check** — Shows warning if backend is offline
- **Multi-page Routing** — Home, FAQ, Privacy, Terms
- **Responsive Design** — Mobile, tablet, desktop
- **Scroll-triggered Animations** — Features and formats animate into view

### Backend
- **Instagram Media Extraction** via yt-dlp (posts, reels, carousels, stories, IGTV)
- **Express.js REST API** — Clean architecture with routes/controllers/services
- **Security** — Helmet, CORS, rate limiting, input validation
- **Error Handling** — Safe error messages, classified errors for frontend
- **Health Check** — `/api/health` endpoint

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, WebGL |
| Backend | Node.js, Express.js, yt-dlp-wrap |
| Security | Helmet, CORS, express-rate-limit |
| HTTP Client | Axios |
| Smooth Scroll | Lenis |

## Quick Start

### Prerequisites
- Node.js 18+
- yt-dlp (auto-downloaded or install manually)

### 1. Install Frontend Dependencies

```bash
cd instagrab
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure Environment

```bash
# Backend
cd server
cp .env.example .env
cd ..

# Frontend (production API URL)
# Edit .env and set VITE_API_URL for production
```

### 4. Start Development

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend (from project root)
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

The Vite dev server proxies `/api` requests to the backend automatically.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/download` | Extract media from Instagram URL |
| GET | `/api/health` | Health check |

### POST /api/download

**Request:**
```json
{
  "url": "https://www.instagram.com/reel/ABC123/"
}
```

**Response:**
```json
{
  "success": true,
  "type": "reel",
  "thumbnail": "https://...",
  "caption": "Post caption...",
  "username": "creator",
  "media": [
    {
      "type": "video",
      "url": "https://...",
      "downloadUrl": "https://...",
      "quality": "1080p",
      "ext": "mp4",
      "width": 1080,
      "height": 1920,
      "filesize": 5242880
    }
  ]
}
```

## Frontend-Backend Integration

The frontend uses an Axios client (`src/lib/api.ts`) that:
- Proxies requests to `/api` during development (Vite proxy)
- Uses `VITE_API_URL` environment variable in production
- Handles network errors with user-friendly messages
- Type-safe response interfaces

### DownloaderCard Integration

The `DownloaderCard` component:
1. Validates the Instagram URL format
2. Sends POST request to `/api/download`
3. Displays thumbnail preview on success
4. Shows caption and username
5. Lists all media items (supports carousels)
6. Provides individual "Download" and "Open" buttons
7. Shows "Download All" button for carousels
8. Handles errors with appropriate messages

## Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Render/Railway/VPS)

See `server/README.md` for detailed deployment guides including:
- Render.com
- Railway.app
- VPS (Ubuntu + Nginx + PM2 + SSL)
- yt-dlp and ffmpeg installation

## Environment Configuration

### Frontend (.env)

```
# Production API URL
VITE_API_URL=https://your-backend-domain.com
```

### Backend (server/.env)

```
PORT=5000
NODE_ENV=production
CORS_ORIGINS=https://your-frontend-domain.com
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW=15
REQUEST_TIMEOUT=30000
```

## Project Structure Details

```
app/
├── src/
│   ├── components/
│   │   ├── FluidGradient.tsx       # WebGL gradient shader
│   │   ├── Navigation.tsx          # Site navigation
│   │   └── DownloaderCard.tsx      # Downloader with API integration
│   ├── sections/
│   │   ├── Hero.tsx                # Full-viewport hero
│   │   ├── Features.tsx            # How It Works grid
│   │   ├── SupportedFormats.tsx    # Content type pills
│   │   ├── FAQ.tsx                 # Accordion FAQ
│   │   └── Footer.tsx              # Site footer
│   ├── pages/
│   │   ├── Home.tsx                # Landing page
│   │   ├── FAQPage.tsx             # Full FAQ page
│   │   ├── PrivacyPage.tsx         # Privacy policy
│   │   └── TermsPage.tsx           # Terms of service
│   ├── hooks/
│   │   └── useLenis.ts             # Smooth scroll hook
│   ├── lib/
│   │   └── api.ts                  # Axios API client
│   ├── App.tsx                     # Root with routes
│   └── main.tsx                    # Entry point
├── server/
│   └── src/
│       ├── routes/
│       │   └── download.routes.js
│       ├── controllers/
│       │   └── download.controller.js
│       ├── services/
│       │   └── instagram.service.js
│       ├── middleware/
│       │   ├── error.middleware.js
│       │   └── rateLimit.middleware.js
│       ├── utils/
│       │   └── validators.js
│       ├── app.js
│       └── server.js
├── design/
│   └── design.md                   # Design PRD
├── vite.config.ts                  # Vite config with proxy
└── .env                            # Frontend environment
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 88+)

## License

MIT
