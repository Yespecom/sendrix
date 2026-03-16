import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy - Sendrix | Your Data, Secured.',
  description: 'How we handle and protect your information at Sendrix.',
}

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information necessary to provide our services, including account details (name, email), connected third-party API keys (stored with AES-256-GCM encryption), and subscriber data strictly for the purpose of email delivery."
    },
    {
      title: "2. How We Use Information",
      content: "Your data is used solely to facilitate the generation and automated sending of onboarding sequences. We do not sell your data or your subscribers' data to third parties."
    },
    {
      title: "3. Data Security",
      content: "We implement industry-standard security measures, including HTTPS encryption for all data in transit and HMAC-SHA256 signatures for webhook verification to prevent unauthorized access."
    },
    {
      title: "4. Your Rights",
      content: "You have the right to access, export, or delete your account and all associated data at any time through your dashboard or by contacting our support team."
    }
  ]

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#0e0e10] mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-[#888780] font-medium">Last updated: March 16, 2026</p>
        </div>
        
        <div className="space-y-12">
          {sections.map((section, i) => (
            <div key={i} className="group">
              <h2 className="text-xl font-bold text-[#0e0e10] mb-4 group-hover:text-[#1D9E75] transition-colors">{section.title}</h2>
              <p className="text-[#5F5E5A] leading-relaxed text-lg">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-[32px] bg-white border border-[#D3D1C7] text-center">
          <p className="text-[#5F5E5A] mb-4">Have questions about our privacy practices?</p>
          <a href="mailto:privacy@sendrix.in" className="text-[#1D9E75] font-bold hover:underline">privacy@sendrix.in</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
