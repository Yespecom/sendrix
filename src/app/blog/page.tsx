import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Blog - Sendrix | Onboarding Insights for SaaS Founders',
  description: 'Deep dives into SaaS user activation, churn reduction, and email onboarding best practices.',
}

export default function BlogPage() {
  const posts = [
    {
      type: "Guide",
      color: "#0F6E56",
      bg: "#E1F5EE",
      slug: "onboarding-email-guide",
      title: "The Complete Guide to User Onboarding Emails",
      desc: "Learn the psychology behind the 'Aha!' moment and how to craft an activation sequence that sticks.",
      readTime: "12 min read"
    },
    {
      type: "Tutorial",
      color: "#1D4ED8",
      bg: "#EEF2FF",
      slug: "reduce-activation-gap",
      title: "How to Reduce SaaS Activation Gap in 30 Days",
      desc: "A step-by-step strategy for increasing your day-30 retention through smart automation and value-focused nudges.",
      readTime: "8 min read"
    },
    {
      type: "Strategy",
      color: "#7C3AED",
      bg: "#F3E8FF",
      slug: "product-launch-strategy",
      title: "Product Launch Email Strategy for Indie Hackers",
      desc: "How to leverage your Product Hunt launch for maximum email conversion and long-term user retention.",
      readTime: "10 min read"
    },
    {
      type: "Technical",
      color: "#D85A30",
      bg: "#FEE2E2",
      slug: "webhook-integration-guide",
      title: "Webhook Email Integration: A Developer's Guide",
      desc: "Mastering the technical side of automated delivery, payload security, and real-time enrollment triggers.",
      readTime: "15 min read"
    }
  ]

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <Navbar />
      
      <main className="flex-1 px-6 pt-32 pb-24">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D3D1C7] text-[#888780] text-[10px] font-bold uppercase tracking-widest mb-8">
            The Sendrix Blog
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-[#0e0e10] mb-6 tracking-tight leading-tight">
            Onboarding insights for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#04342C] to-[#1D9E75]">SaaS founders.</span>
          </h1>
          <p className="text-xl text-[#5F5E5A] max-w-2xl mx-auto leading-relaxed">
            Stay ahead of the activation gap. We share deep dives into user psychology, email copywriting, and growth automation.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, i) => (
            <Link key={i} href={`/blog/${post.slug}`} className="group bg-white p-10 rounded-[40px] border border-[#D3D1C7] hover:border-[#1D9E75] transition-all hover:shadow-[0_20px_50px_rgba(4,52,44,0.08)] flex flex-col cursor-pointer">
              <div className="flex items-center justify-between mb-8">
                <div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ color: post.color, backgroundColor: post.bg }}>
                  {post.type}
                </div>
                <div className="flex items-center gap-1.5 text-[#888780] text-xs">
                  <Clock size={14} />
                  {post.readTime}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-[#0e0e10] mb-4 group-hover:text-[#0F6E56] transition-colors">{post.title}</h3>
              <p className="text-[#5F5E5A] leading-relaxed mb-8 flex-1">{post.desc}</p>
              
              <div className="flex items-center gap-2 text-[#0F6E56] font-bold text-sm">
                Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
