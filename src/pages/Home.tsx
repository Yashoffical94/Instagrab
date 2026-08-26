import Hero from '@/sections/Hero'
import Features from '@/sections/Features'
import SupportedFormats from '@/sections/SupportedFormats'
import FAQ from '@/sections/FAQ'
import Footer from '@/sections/Footer'

export default function Home() {
  return (
    <div className="relative bg-black min-h-screen">
      <Hero />
      <Features />
      <SupportedFormats />
      <FAQ />
      <Footer />
    </div>
  )
}
