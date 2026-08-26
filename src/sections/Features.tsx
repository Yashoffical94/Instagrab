import { useEffect, useRef } from 'react'
import { Link2, ClipboardPaste, Download } from 'lucide-react'

const features = [
  {
    icon: Link2,
    title: 'Copy the Link',
    description: 'Open Instagram and copy the URL of any post, reel, story, or carousel you want to save.',
  },
  {
    icon: ClipboardPaste,
    title: 'Paste & Download',
    description: 'Paste the link into the input field above and hit the download button — we handle the rest.',
  },
  {
    icon: Download,
    title: 'Get Your Media',
    description: 'Your photos and videos are ready instantly. No watermarks, no sign-up required.',
  },
]

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = cardsRef.current.filter(Boolean)
            cards.forEach((card, i) => {
              if (card) {
                setTimeout(() => {
                  card.style.opacity = '1'
                  card.style.transform = 'translateY(0)'
                }, i * 120)
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
      id="features"
      ref={sectionRef}
      className="relative w-full py-20 md:py-28 px-6"
      style={{ background: 'rgba(10, 7, 20, 0.92)' }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono-accent text-xs uppercase tracking-[2px] text-fuchsia-500 text-center mb-10">
          How It Works
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => { cardsRef.current[i] = el }}
              className="feature-card rounded-2xl p-8"
              style={{
                opacity: 0,
                transform: 'translateY(40px)',
                transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <div className="w-14 h-14 rounded-[14px] bg-violet-500/[0.12] flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
