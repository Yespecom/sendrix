import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import SpotsBar from '@/components/SpotsBar'
import PerksSection from '@/components/PerksSection'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import LandingChatPopup from '@/components/LandingChatPopup'
import { getLandingStats } from '@/lib/landing-stats'
import LaunchPoster from '@/components/LaunchPoster'
import JsonLd from '@/components/JsonLd'
import FAQSection from '@/components/FAQSection'

export const revalidate = 60

export default async function LandingPage() {
  const stats = await getLandingStats()
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Sendrix",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": "Create agency-grade email sequences in 10 minutes. AI-written onboarding automation for SaaS founders."
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How long does it take to set up Sendrix?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Setup takes under 10 minutes. Answer 5 questions about your product, and our AI generates a full 6-email onboarding sequence ready for your domain."
        }
      },
      {
        "@type": "Question",
        "name": "Which email providers are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sendrix is built on top of Resend. You can connect your domain in seconds using your Resend API key."
        }
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans">
      <JsonLd data={schemaData} />
      <JsonLd data={faqSchema} />
      <Navbar />

      
      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 overflow-hidden flex flex-col items-center">
        {/* Glowing Background Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0F6E56]/40 via-[#04342C]/5 to-transparent blur-[80px] -z-10 pointer-events-none"></div>

        <div className="text-center max-w-4xl mx-auto z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/30 text-[#0F6E56] text-xs font-bold uppercase tracking-wider mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D9E75] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1D9E75]"></span>
            </span>
            Early Access — 100 Founding Member spots. 47 claimed.
          </div>
          
          <h1 className="text-4xl md:text-[68px] font-[800] text-[#0e0e10] leading-[1.05] tracking-tight mb-8">
            Sendrix: AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#04342C] to-[#1D9E75]">Onboarding Emails in 10 Minutes.</span>
          </h1>
          <p className="text-xl text-[#5F5E5A] mb-10 max-w-2xl mx-auto leading-relaxed">
            Eliminate churn with a SaaS email writer built for founders. Optimize your activation gap following onboarding email best practices.
          </p>
          

        </div>
        
        {/* Real Product Screenshot + Launch Poster */}
        <div className="mt-20 w-full max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-7 items-start">
          <div className="rounded-[28px] bg-white p-3 md:p-4 border border-[#D3D1C7] shadow-2xl">
            <div className="h-10 rounded-t-[16px] bg-[#F5F3EC] border border-[#E5E2D7] border-b-0 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D85A30]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#EF9F27]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#1D9E75]"></div>
              <span className="ml-3 text-[11px] tracking-[0.16em] font-semibold uppercase text-[#888780]">Sendrix Workspace Preview</span>
            </div>
            <div className="rounded-b-[16px] overflow-hidden border border-[#E5E2D7]">
              <Image
                src="/landing-workspace-preview.png"
                alt="Sendrix workspace setup and email preview screen"
                width={2880}
                height={1390}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          <div className="w-full max-w-[340px] mx-auto lg:mx-0 lg:mt-2">
            <LaunchPoster />
          </div>
        </div>
      </section>

      <PerksSection />
      <Testimonials />
      <Pricing />
      <FAQSection />
      <Footer />
      <LandingChatPopup />
    </div>
  )
}
