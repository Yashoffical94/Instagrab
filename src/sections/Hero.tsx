import FluidGradient from '@/components/FluidGradient'
import DownloaderCard from '@/components/DownloaderCard'

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <FluidGradient />
      <div className="relative z-10 w-full flex items-center justify-center px-6 py-20">
        <DownloaderCard />
      </div>
    </section>
  )
}
