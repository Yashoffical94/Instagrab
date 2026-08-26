import { Link } from 'react-router'
import { Download, Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      className="relative w-full py-8 px-6 border-t border-white/[0.06]"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Download className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-bold text-sm">InstaGrab</span>
          </Link>
          <p className="text-[13px] text-slate-400">Fast, free Instagram downloads.</p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/terms"
            className="text-[13px] text-white/50 hover:text-white transition-colors duration-200"
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            className="text-[13px] text-white/50 hover:text-white transition-colors duration-200"
          >
            Privacy
          </Link>
          <Link
            to="/faq"
            className="text-[13px] text-white/50 hover:text-white transition-colors duration-200"
          >
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors duration-200"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors duration-200"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-6 pt-4 border-t border-white/[0.04] text-center">
        <p className="text-xs text-white/30">
          InstaGrab is not affiliated with Instagram or Meta. Use responsibly.
        </p>
      </div>
    </footer>
  )
}
