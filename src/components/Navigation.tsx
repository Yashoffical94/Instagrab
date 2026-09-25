import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Download, Menu, X } from 'lucide-react'

export default function Navigation() {
  const [visible, setVisible] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isHome = location.pathname === '/'

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: isHome ? '#features' : '/#features' },
    { label: 'FAQ', href: '/faq' },
  ]

  const scrollToFeatures = (e: React.MouseEvent) => {
    if (!isHome) return
    e.preventDefault()
    const el = document.getElementById('features')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 md:px-12"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
          <Download className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">InstaGrab</span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            onClick={link.href === '#features' ? scrollToFeatures : undefined}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-white/70 hover:text-white transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu — closes on navigation via link click handlers */}
      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => {
                  setMobileOpen(false)
                  if (link.href === '#features') scrollToFeatures(e)
                }}
                className="text-sm font-medium text-white/70 hover:text-white py-2 px-3 rounded-lg hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
