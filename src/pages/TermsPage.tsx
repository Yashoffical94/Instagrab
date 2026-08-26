import { Link } from 'react-router'
import { ArrowLeft, FileText } from 'lucide-react'
import Footer from '@/sections/Footer'

export default function TermsPage() {
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

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="font-mono-accent text-xs uppercase tracking-[2px] text-fuchsia-500">
                Legal
              </p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 leading-relaxed">
              Welcome to InstaGrab. By using our service, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Acceptance of Terms</h2>
            <p className="text-slate-400 leading-relaxed">
              By accessing and using InstaGrab, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Description of Service</h2>
            <p className="text-slate-400 leading-relaxed">
              InstaGrab provides a tool that allows users to download public Instagram content including photos, videos, reels, stories, and carousel posts. The service is provided as-is and is intended for personal, non-commercial use only.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Acceptable Use</h2>
            <p className="text-slate-400 leading-relaxed">
              You agree to use InstaGrab only for lawful purposes and in accordance with these terms. You are solely responsible for ensuring that your use of downloaded content complies with all applicable laws, regulations, and third-party rights including copyright and intellectual property laws.
            </p>
            <p className="text-slate-400 leading-relaxed mt-4">
              You may not use InstaGrab to download content for redistribution, commercial purposes, or any use that violates the rights of content creators or Instagram Terms of Service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Intellectual Property</h2>
            <p className="text-slate-400 leading-relaxed">
              All content downloaded through InstaGrab belongs to its respective owners. InstaGrab does not claim ownership of any downloaded content. Users are responsible for respecting the intellectual property rights of content creators.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Prohibited Activities</h2>
            <p className="text-slate-400 leading-relaxed">
              You may not:
            </p>
            <ul className="list-disc list-inside text-slate-400 leading-relaxed space-y-2 mt-2">
              <li>Use InstaGrab to download content from private accounts</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to interfere with or disrupt the service</li>
              <li>Use automated systems or software to extract data from our platform</li>
              <li>Redistribute downloaded content without proper authorization</li>
              <li>Use the service in any way that could damage, disable, or impair our servers</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Disclaimer of Warranties</h2>
            <p className="text-slate-400 leading-relaxed">
              InstaGrab is provided on an as-is and as-available basis. We make no warranties, expressed or implied, regarding the reliability, availability, or suitability of the service for any particular purpose.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-slate-400 leading-relaxed">
              In no event shall InstaGrab be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Modifications to Service</h2>
            <p className="text-slate-400 leading-relaxed">
              We reserve the right to modify or discontinue InstaGrab at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Governing Law</h2>
            <p className="text-slate-400 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which InstaGrab operates, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Changes to Terms</h2>
            <p className="text-slate-400 leading-relaxed">
              We reserve the right to update or change these Terms of Service at any time. Your continued use of the service after any changes constitutes acceptance of those changes.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact</h2>
            <p className="text-slate-400 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our support channels.
            </p>
          </div>

          <p className="text-xs text-white/30 mt-12 pt-6 border-t border-white/[0.06]">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
