import { useEffect, useRef } from 'react'
import { Image, Video, Library, Eye } from 'lucide-react'

const formats = [
  { icon: Image, label: 'Posts' },
  { icon: Video, label: 'Reels' },
  { icon: Eye, label: 'Stories' },
  { icon: Library, label: 'Carousels' },
  { icon: Video, label: 'IGTV' },
]

export default function SupportedFormats() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pills = pillsRef.current.filter(Boolean)
            pills.forEach((pill, i) => {
              if (pill) {
                setTimeout(() => {
                  pill.style.opacity = '1'
                  pill.style.transform = 'scale(1)'
                }, i * 80)
              }
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 md:py-20 px-6"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div className="max-w-[900px] mx-auto">
        <p className="font-mono-accent text-xs uppercase tracking-[2px] text-fuchsia-500 text-center mb-8">
          Supported Content
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {formats.map((format, i) => (
            <div
              key={format.label}
              ref={(el) => { pillsRef.current[i] = el }}
              className="format-pill rounded-xl px-6 py-4 flex items-center gap-3 cursor-default"
              style={{
                opacity: 0,
                transform: 'scale(0.9)',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <format.icon className="w-5 h-5 text-fuchsia-400" />
              <span className="text-sm font-medium text-white">{format.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
