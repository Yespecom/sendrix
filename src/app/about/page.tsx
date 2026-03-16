import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Rocket, Target, Users, Zap } from 'lucide-react'

export const metadata = {
  title: 'About - Sendrix | Bridging the SaaS Activation Gap',
  description: 'Learn about the mission behind Sendrix: helping founders automate onboarding and eliminate churn with AI.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-32 pb-24 text-center bg-white border-b border-[#D3D1C7]">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF0D8] border border-[#EF9F27]/30 text-[#BA7517] text-[10px] font-bold uppercase tracking-widest mb-8">
              Our Mission
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#0e0e10] mb-8 leading-[1.05] tracking-tight">
              Bridging the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#BA7517] to-[#EF9F27]">SaaS Activation Gap.</span>
            </h1>
            <p className="text-xl text-[#5F5E5A] max-w-2xl mx-auto leading-relaxed">
              We started Sendrix because we saw too many great products fail not because they lacked value, but because they lacked a voice. We're here to give every founder a world-class onboarding team—powered by AI.
            </p>
          </div>
        </section>

        {/* The Problem / Solution */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black text-[#0e0e10] tracking-tight">The "Day One" Problem.</h2>
              <p className="text-lg text-[#5F5E5A] leading-relaxed">
                Most users who sign up for a SaaS never come back. It's not because the product is bad—it's because they didn't hit their "Aha!" moment fast enough. 
              </p>
              <div className="p-8 rounded-[32px] bg-[#04342C] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1D9E75]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-xl font-medium leading-relaxed italic relative z-10">
                  "Onboarding shouldn't be a technical chore. It should be a conversion engine. We built Sendrix to make that true for every founder."
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Rocket, label: "Fast to Live", desc: "From signup to a live 6-email sequence in under 10 minutes." },
                { icon: Target, label: "Founder First", desc: "Built with the constraints and needs of solo-founders in mind." },
                { icon: Zap, label: "AI Powered", desc: "Leveraging the world's best LLMs to write high-converting copy." },
                { icon: Users, label: "Community Driven", desc: "Growing alongside the best indie hackers and SaaS studios." }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[32px] bg-white border border-[#D3D1C7] hover:border-[#1D9E75] transition-all">
                  <item.icon className="text-[#1D9E75] mb-4" size={28} />
                  <h4 className="font-bold text-[#0e0e10] mb-2">{item.label}</h4>
                  <p className="text-sm text-[#888780] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#04342C] text-center px-6 mt-24">
          <h2 className="text-4xl font-bold text-white mb-6">Join the movement.</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto">Automate your growth and focus on building what matters.</p>
          <Link href="/signup" className="inline-block px-10 py-5 bg-[#EF9F27] text-[#04342C] font-black rounded-2xl hover:bg-[#f5a82e] transition-all hover:scale-105 shadow-2xl">
            Claim Your Founding Spot
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
