import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Terms of Service - Sendrix | Legal Framework',
  description: 'The terms and conditions for using the Sendrix onboarding platform.',
}

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using Sendrix, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    },
    {
      title: "2. Description of Service",
      content: "Sendrix provides an AI-powered onboarding automation platform. We provide the intelligence and automation layer; email delivery is executed via your own connected third-party provider account (e.g., Resend)."
    },
    {
      title: "3. Acceptable Use",
      content: "You agree not to use Sendrix for any unlawful purposes, including but not limited to spamming, phishing, or sending unsolicited marketing communications. You must comply with all local and international anti-spam regulations."
    },
    {
      title: "4. Limitation of Liability",
      content: "Sendrix provides the service on an 'as-is' basis. We are not liable for any disruptions in service caused by third-party providers or issues resulting from your specific sequence configurations."
    }
  ]

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#0e0e10] mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-[#888780] font-medium">Last updated: March 16, 2026</p>
        </div>
        
        <div className="space-y-12">
          {sections.map((section, i) => (
            <div key={i} className="group">
              <h2 className="text-xl font-bold text-[#0e0e10] mb-4 group-hover:text-[#BA7517] transition-colors">{section.title}</h2>
              <p className="text-[#5F5E5A] leading-relaxed text-lg">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-[32px] bg-white border border-[#D3D1C7] text-center">
          <p className="text-[#5F5E5A] mb-4">Questions about our legal terms?</p>
          <a href="mailto:legal@sendrix.in" className="text-[#BA7517] font-bold hover:underline">legal@sendrix.in</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
