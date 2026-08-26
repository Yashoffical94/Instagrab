import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Is InstaGrab free to use?',
    answer: 'Yes, InstaGrab is completely free to use. You can download unlimited Instagram photos, videos, reels, and stories without any charges or subscriptions.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No account or sign-up is required. Simply paste the Instagram URL and download your content instantly. We believe in keeping things simple and accessible.',
  },
  {
    question: 'What types of content can I download?',
    answer: 'InstaGrab supports posts (single images), reels, IGTV videos, stories, and carousels (multiple photos/videos in a single post). Just paste the link and we will handle the rest.',
  },
  {
    question: 'Will the downloaded media have watermarks?',
    answer: 'No, all downloads are clean and watermark-free. You get the original quality content exactly as it was uploaded to Instagram.',
  },
  {
    question: 'Can I download from private accounts?',
    answer: 'No, InstaGrab can only download content from public Instagram accounts. Private account content cannot be accessed due to Instagram privacy settings.',
  },
  {
    question: 'Is it legal to download Instagram content?',
    answer: 'Downloading content for personal use is generally acceptable. However, you should always respect copyright and intellectual property rights. Do not redistribute or use downloaded content commercially without permission from the original creator.',
  },
  {
    question: 'Why is my download not working?',
    answer: 'Common issues include invalid URLs, private accounts, deleted content, or temporary rate limiting. Make sure the URL is correct, the post is public, and try again after a few minutes if you hit a rate limit.',
  },
  {
    question: 'What quality are the downloads?',
    answer: 'We provide the highest available quality for all downloads. Photos are downloaded at their original resolution, and videos are fetched in the best available format (typically up to 1080p depending on the source).',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative w-full py-20 md:py-28 px-6"
      style={{ background: 'rgba(10, 7, 20, 0.92)' }}
    >
      <div
        className="max-w-[800px] mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <p className="font-mono-accent text-xs uppercase tracking-[2px] text-fuchsia-500 text-center mb-4">
          Got Questions?
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-12 tracking-tight">
          Frequently Asked Questions
        </h2>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-200 hover:border-white/[0.1]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.06}s`,
              }}
            >
              <button
                onClick={() => toggleQuestion(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm md:text-base font-medium text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-violet-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: openIndex === i ? '300px' : '0',
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <div className="px-6 pb-4 text-sm text-slate-400 leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
