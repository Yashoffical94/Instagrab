import { useState, useRef, useEffect } from 'react'
import { ClipboardPaste, Download, Check, AlertCircle, Loader2, Image, Video, User, FileText, ExternalLink } from 'lucide-react'
import { downloadMedia, checkHealth, isApiError } from '@/lib/api'
import type { DownloadResponse, MediaItem } from '@/lib/api'

export default function DownloaderCard() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState<DownloadResponse | null>(null)
  const [serverOnline, setServerOnline] = useState<boolean | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Check server health on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        await checkHealth()
        setServerOnline(true)
      } catch {
        setServerOnline(false)
      }
    }
    checkServer()
  }, [])

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrl(text)
      // Clear previous result when pasting new URL
      setResult(null)
      setStatus('idle')
    } catch {
      inputRef.current?.focus()
    }
  }

  const validateUrl = (input: string): boolean => {
    const patterns = [
      /instagram\.com\/(p|reel|reels|tv|stories)\//i,
      /instagram\.com\/share\/(p|reel)\//i,
      /instagr\.am\/(p|reel|reels|tv|stories)\//i,
    ]
    return patterns.some((p) => p.test(input))
  }

  const handleDownload = async () => {
    // Reset previous state
    setResult(null)

    if (!url.trim()) {
      setStatus('error')
      setErrorMessage('Please enter an Instagram URL')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    if (!validateUrl(url)) {
      setStatus('error')
      setErrorMessage('Invalid Instagram URL')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    setStatus('loading')

    try {
      const data = await downloadMedia(url.trim())
      setResult(data)
      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      // Handle structured API errors
      if (isApiError(err)) {
        setErrorMessage(err.error)
      } else if (err instanceof Error && err.message) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Something went wrong. Please try again.')
      }
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleDownload()
  }

  const handleDownloadFile = (item: MediaItem) => {
    // Create a temporary anchor element for download
    const a = document.createElement('a')
    a.href = item.downloadUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    // Suggest filename
    const ext = item.ext || (item.type === 'video' ? 'mp4' : 'jpg')
    const timestamp = Date.now()
    a.download = `instagrab_${timestamp}.${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleOpenInNewTab = (item: MediaItem) => {
    window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  const supportedTypes = [
    { label: 'Posts' },
    { label: 'Reels' },
    { label: 'Carousels' },
    { label: 'Stories' },
    { label: 'IGTV' },
  ]

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin-fast" />
            Processing...
          </span>
        )
      case 'success':
        return (
          <span className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Done!
          </span>
        )
      case 'error':
        return (
          <span className="flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errorMessage.length > 40 ? errorMessage.substring(0, 40) + '...' : errorMessage}
          </span>
        )
      default:
        return (
          <span className="flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Download
          </span>
        )
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'reel':
      case 'igtv':
      case 'story':
        return <Video className="w-4 h-4" />
      default:
        return <Image className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      className="w-full max-w-[520px] px-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="glass-card rounded-[20px] p-8 md:p-10">
        <p
          className="font-mono-accent text-xs uppercase tracking-[2px] text-fuchsia-400/80 text-center mb-5"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.1s',
          }}
        >
          Paste Instagram URL
        </p>

        {/* Server status indicator */}
        {serverOnline === false && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-xs text-yellow-300">
              Server is offline. Start the backend or check your connection.
            </span>
          </div>
        )}

        <div
          className="relative"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease 0.2s',
          }}
        >
          <label htmlFor="instagram-url" className="sr-only">
            Instagram URL
          </label>
          <input
            ref={inputRef}
            id="instagram-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              // Clear result when user types a new URL
              if (result) {
                setResult(null)
                setStatus('idle')
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://instagram.com/p/..."
            className="w-full h-[52px] bg-black/40 border border-violet-500/30 rounded-xl text-white text-[15px] px-4 pr-14 placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500 focus:ring-[3px] focus:ring-fuchsia-500/15 transition-all duration-200"
          />
          <button
            onClick={handlePaste}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-9 bg-violet-500/20 hover:bg-violet-500/35 rounded-lg flex items-center justify-center transition-colors duration-200"
            aria-label="Paste from clipboard"
          >
            <ClipboardPaste className="w-4 h-4 text-violet-300" />
          </button>
        </div>

        <button
          onClick={handleDownload}
          disabled={status === 'loading'}
          className={`gradient-btn w-full h-[52px] mt-4 rounded-xl text-white text-[15px] font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
            status === 'error'
              ? '!bg-red-600 hover:!bg-red-500'
              : status === 'success'
              ? '!bg-emerald-600 hover:!bg-emerald-500'
              : ''
          }`}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.6s ease 0.3s',
          }}
        >
          {getButtonContent()}
        </button>

        {/* Error message display (when not in button) */}
        {status === 'error' && errorMessage.length > 40 && (
          <div className="mt-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-300">{errorMessage}</p>
          </div>
        )}

        {/* Result section - Thumbnail & Info */}
        {result && status === 'success' && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Thumbnail */}
            {result.thumbnail && (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img
                  src={result.thumbnail}
                  alt="Instagram content preview"
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-xs font-medium text-white capitalize flex items-center gap-1.5">
                  {getTypeIcon(result.type)}
                  {result.type}
                </div>
              </div>
            )}

            {/* Caption */}
            {result.caption && (
              <div className="flex gap-3 items-start">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                  {result.caption}
                </p>
              </div>
            )}

            {/* Username */}
            {result.username && (
              <div className="flex gap-3 items-center">
                <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-violet-300 font-medium">@{result.username}</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-medium text-slate-400 mb-3">
                {result.media.length > 1 ? `${result.media.length} items found` : '1 item found'}
              </p>

              {/* Media items list */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {result.media.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 transition-all duration-200 group"
                  >
                    {/* Media icon */}
                    <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                      {item.type === 'video' ? (
                        <Video className="w-4 h-4 text-violet-400" />
                      ) : (
                        <Image className="w-4 h-4 text-violet-400" />
                      )}
                    </div>

                    {/* Media info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.type === 'video' ? 'Video' : 'Image'} {result.media.length > 1 ? `#${index + 1}` : ''}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.quality && item.quality !== 'unknown' ? item.quality : ''}
                        {item.width && item.height ? ` ${item.width}x${item.height}` : ''}
                        {item.filesize ? ` ${formatFileSize(item.filesize)}` : ''}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleOpenInNewTab(item)}
                        className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200"
                        title="Open in new tab"
                        aria-label="Open in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(item)}
                        className="p-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/35 text-violet-300 hover:text-white transition-all duration-200"
                        title="Download"
                        aria-label="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download all button (for carousels) */}
            {result.media.length > 1 && (
              <button
                onClick={() => result.media.forEach((item, i) => setTimeout(() => handleDownloadFile(item), i * 500))}
                className="w-full h-10 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/20 text-sm font-medium text-violet-300 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All ({result.media.length} items)
              </button>
            )}
          </div>
        )}

        {/* Supported types */}
        <div
          className="flex flex-wrap gap-2.5 justify-center mt-7"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}
        >
          {supportedTypes.map((type) => (
            <span
              key={type.label}
              className="bg-white/[0.06] rounded-full px-3.5 py-1.5 text-xs font-medium text-white/60 flex items-center gap-1.5"
            >
              {type.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
