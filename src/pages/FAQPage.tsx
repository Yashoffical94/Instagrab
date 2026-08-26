import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown, ArrowLeft } from 'lucide-react'
import Footer from '@/sections/Footer'

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
  {
    question: 'Is there a download limit?',
    answer: 'There is no strict download limit for regular users. However, we implement rate limiting to prevent abuse and ensure fair usage for all visitors. If you encounter a rate limit, please wait a few minutes before trying again.',
  },
  {
    question: 'Can I download carousel posts?',
    answer: 'Yes, carousel posts (multiple images/videos in a single post) are fully supported. All items in the carousel will be available for individual download.',
  },
  {
    question: 'Does InstaGrab work on mobile?',
    answer: 'Absolutely! InstaGrab is fully responsive and works on all devices including smartphones, tablets, and desktops. The interface adapts to your screen size for the best experience.',
  },
  {
    question: 'How do I copy an Instagram link?',
    answer: 'On the Instagram app, tap the three dots (...) on any post and select "Copy Link." On the web, copy the URL directly from your browser\'s address bar.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="relative bg-black min-h-screen">
      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <p className="font-mono-accent text-xs uppercase tracking-[2px] text-fuchsia-500 mb-4">
            Support Center
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 mb-12 max-w-[600px]">
            Everything you need to know about using InstaGrab. Can not find what you are looking for? Feel free to reach out.
          </p>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-200 hover:border-white/[0.1]"
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
      </div>
      <Footer />
    </div>
  )
}
