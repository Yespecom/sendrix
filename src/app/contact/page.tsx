import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, MessageSquare, Twitter, Github, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Contact - Sendrix | We\'re Here to Help',
  description: 'Get in touch with the Sendrix team for support, partnerships, or just to say hi.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <Navbar />
      
      <main className="flex-1">
        <section className="px-6 pt-32 pb-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-[#0e0e10] mb-6 tracking-tight leading-tight">
              Let's build <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#04342C] to-[#1D9E75]">something great together.</span>
            </h1>
            <p className="text-xl text-[#5F5E5A] max-w-2xl mx-auto">
              Have questions about integrating with Resend or setting up your first sequence? Our team is always ready to jump in.
            </p>
          </div>
        </section>

        <section className="pb-24 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form Placeholder */}
            <div className="bg-white p-10 rounded-[32px] border border-[#D3D1C7] shadow-xl">
              <h2 className="text-2xl font-bold text-[#0e0e10] mb-8">Send us a message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2 block">Full Name</label>
                    <input type="text" placeholder="Arjun Kumar" className="w-full p-4 rounded-xl bg-[#F5F3EC] border border-[#D3D1C7] outline-none focus:border-[#1D9E75] transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2 block">Email Address</label>
                    <input type="email" placeholder="arjun@product.com" className="w-full p-4 rounded-xl bg-[#F5F3EC] border border-[#D3D1C7] outline-none focus:border-[#1D9E75] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2 block">Message</label>
                  <textarea rows={5} placeholder="How can we help you?" className="w-full p-4 rounded-xl bg-[#F5F3EC] border border-[#D3D1C7] outline-none focus:border-[#1D9E75] transition-all resize-none"></textarea>
                </div>
                <button type="button" className="w-full py-4 bg-[#04342C] text-white font-bold rounded-xl hover:bg-[#03261F] transition-all shadow-lg">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#E1F5EE] flex items-center justify-center text-[#1D9E75] shrink-0">
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0e0e10] mb-1">Email Support</h3>
                  <p className="text-[#5F5E5A] mb-2">Typically replies in under 4 hours.</p>
                  <a href="mailto:support@sendrix.in" className="text-[#1D9E75] font-bold hover:underline">support@sendrix.in</a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF0D8] flex items-center justify-center text-[#BA7517] shrink-0">
                  <Twitter size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0e0e10] mb-1">Join the community</h3>
                  <p className="text-[#5F5E5A] mb-2">Follow our journey and get tips on Twitter.</p>
                  <a href="https://twitter.com/sendrixai" target="_blank" className="text-[#BA7517] font-bold hover:underline">@sendrixai</a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#1D4ED8] shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0e0e10] mb-1">Office</h3>
                  <p className="text-[#5F5E5A]">Bangalore, India</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
