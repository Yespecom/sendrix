import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HowItWorks from '@/components/HowItWorks'
import JsonLd from '@/components/JsonLd'
import { Metadata } from 'next'
import { Zap, Globe, Shield, BarChart3, Palette, Mail, Rocket } from 'lucide-react'
import Link from 'next/link'
import SequenceAnimation from '@/components/features/SequenceAnimation'

export const metadata: Metadata = {
  title: 'Features - Sendrix | AI Email Automation for SaaS Products',
  description: 'Explore Sendrix features: AI sequence generation, workspace management, webhook integration, analytics, design templates, and more.',
  alternates: {
    canonical: '/features',
  },
}


export default function FeaturesPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Sendrix Features",
    "applicationCategory": "BusinessApplication",
    "featureList": [
      "AI Sequence Engine",
      "Premium Design Templates",
      "Webhook Automation",
      "Workspace Management",
      "Realtime Activity Logs"
    ]
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <JsonLd data={schemaData} />
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 pt-32 pb-24 overflow-hidden text-center bg-white border-b border-[#D3D1C7]">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/30 text-[#0F6E56] text-[10px] font-bold uppercase tracking-widest mb-8">
              Sendrix Features
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#0e0e10] mb-8 leading-[1.05] tracking-tight">
              Powerful tools to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#04342C] to-[#1D9E75]">bridge the activation gap.</span>
            </h1>
            <p className="text-xl text-[#5F5E5A] max-w-2xl mx-auto leading-relaxed mb-10">
              Stop fighting with complicated email builders. Sendrix combines the "brain" of Claude AI with the delivery power of Resend to automate your growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="px-8 py-4 rounded-xl bg-[#04342C] text-white font-bold hover:bg-[#03261F] transition-all hover:-translate-y-1 shadow-lg">
                Get Started Free
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-xl bg-white border border-[#D3D1C7] text-[#0e0e10] font-bold hover:border-[#04342C] transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Feature 1: AI Engine */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] mb-6">
                  <Rocket size={24} />
                </div>
                <h2 className="text-4xl font-black text-[#0e0e10] mb-6 tracking-tight">The AI Onboarding Engine</h2>
                <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
                  Our Claude-powered AI doesn't just write templates. It understands your "Aha!" moment and builds a tailored 6-email journey designed to convert sleepers into active users.
                </p>
                <div className="space-y-4">
                  {[
                    { title: "Dynamic Logic", desc: "Sequence follows activation milestones, not just time." },
                    { title: "Context Aware", desc: "Writes copy specific to your target audience and user persona." },
                    { title: "Optimized Flow", desc: "Includes Welcome, Activation, Value, Social Proof, and Friction Removal." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center shrink-0">
                        <Zap size={10} className="text-white fill-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0e0e10] text-sm">{item.title}</h4>
                        <p className="text-[#888780] text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#E1F5EE] to-[#FAF0D8] rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-2 bg-white rounded-[32px] border border-[#D3D1C7] shadow-2xl overflow-hidden">
                  <SequenceAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Grid */}
        <section className="py-24 bg-[#F5F3EC]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-[#0e0e10] mb-4">Built for Tech-First Teams</h2>
              <p className="text-[#5F5E5A]">Developer-friendly features that save weeks of custom engineering.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Webhook */}
              <div className="bg-white p-8 rounded-[32px] border border-[#D3D1C7] transition-all hover:border-[#1D9E75] group">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3EC] flex items-center justify-center text-[#0e0e10] mb-6 group-hover:bg-[#E1F5EE] group-hover:text-[#0F6E56] transition-colors">
                  <Globe size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#0e0e10] mb-3">Webhook Integration</h3>
                <p className="text-sm text-[#5F5E5A] leading-relaxed">
                  Trigger sequences directly from your app. One simple POST request to enroll your new signs. No complex SDKs required.
                </p>
              </div>

              {/* Workspace */}
              <div className="bg-white p-8 rounded-[32px] border border-[#D3D1C7] transition-all hover:border-[#1D9E75] group">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3EC] flex items-center justify-center text-[#0e0e10] mb-6 group-hover:bg-[#E1F5EE] group-hover:text-[#0F6E56] transition-colors">
                  <Shield size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#0e0e10] mb-3">Workspace Isolation</h3>
                <p className="text-sm text-[#5F5E5A] leading-relaxed">
                  Manage multiple products or client projects under one account. Each workspace has its own sequences, logs, and billing.
                </p>
              </div>

              {/* Design */}
              <div className="bg-white p-8 rounded-[32px] border border-[#D3D1C7] transition-all hover:border-[#1D9E75] group">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3EC] flex items-center justify-center text-[#0e0e10] mb-6 group-hover:bg-[#FAF0D8] group-hover:text-[#BA7517] transition-colors">
                  <Palette size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#0e0e10] mb-3">Premium Templates</h3>
                <p className="text-sm text-[#5F5E5A] leading-relaxed">
                  Focus on the content while we handle the style. Our responsive templates are tested across all major clients for perfect delivery.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Existing How It Works for detailed flow */}
        <HowItWorks />

        {/* Fast CTA */}
        <section className="py-24 bg-[#04342C] text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to fix your activation gap?</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto">Set up your workspace and generate your first sequence in under 10 minutes.</p>
          <Link href="/signup" className="inline-block px-10 py-5 bg-[#EF9F27] text-[#04342C] font-black rounded-2xl hover:bg-[#f5a82e] transition-all hover:scale-105 active:scale-95 shadow-2xl">
            Start My 10-Minute Setup
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
