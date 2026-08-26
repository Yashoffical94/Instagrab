import { Link } from 'react-router'
import { ArrowLeft, Shield } from 'lucide-react'
import Footer from '@/sections/Footer'

export default function PrivacyPage() {
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
              <Shield className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="font-mono-accent text-xs uppercase tracking-[2px] text-fuchsia-500">
                Legal
              </p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-400 leading-relaxed">
              At InstaGrab, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our service.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Information We Do Not Collect</h2>
            <p className="text-slate-400 leading-relaxed">
              InstaGrab does not require user accounts, and we do not collect personal information such as your name, email address, or phone number. We do not track your browsing history or store any identifiable information about you.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Information We Process</h2>
            <p className="text-slate-400 leading-relaxed">
              When you use our service, the only information we process is the Instagram URL you provide. This URL is used solely to fetch the requested content and is not stored on our servers after the request is complete.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Cookies</h2>
            <p className="text-slate-400 leading-relaxed">
              We use minimal cookies to ensure the proper functioning of our website. These cookies do not contain any personal information and are used only for technical purposes such as maintaining your session preferences.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Third-Party Services</h2>
            <p className="text-slate-400 leading-relaxed">
              InstaGrab does not integrate with third-party analytics or advertising services. We do not share any data with external parties.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Content Downloads</h2>
            <p className="text-slate-400 leading-relaxed">
              When you download content through InstaGrab, you are responsible for ensuring that your use of that content complies with applicable laws and Instagram Terms of Service. We do not monitor or log what content you download.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Data Security</h2>
            <p className="text-slate-400 leading-relaxed">
              We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of data. All communications between your browser and our servers are encrypted using HTTPS.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Changes to This Policy</h2>
            <p className="text-slate-400 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
            <p className="text-slate-400 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our support channels.
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
