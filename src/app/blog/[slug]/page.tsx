import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ChevronLeft, Calendar, User, Clock, ArrowRight, Zap, Target, Rocket } from 'lucide-react'
import { notFound } from 'next/navigation'

const BLOG_POSTS = {
  'onboarding-email-guide': {
    title: "The Complete Guide to User Onboarding Emails",
    type: "Guide",
    date: "March 12, 2026",
    readTime: "12 min read",
    author: "Sendrix Team",
    intro: "Learn the psychology behind the 'Aha!' moment and how to craft an activation sequence that sticks.",
    content: (
      <>
        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">The Psychology of the First 60 Minutes</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          When a user signs up for your SaaS, they are in a state of 'high intent' but also 'high skepticism'. Every minute that passes without them seeing value increases the likelihood they'll never come back. This is where your onboarding sequence comes in. It's not just a set of emails; it's a bridge from curiosity to commitment.
        </p>
        
        <div className="my-12 p-8 bg-[#E1F5EE] border border-[#1D9E75]/30 rounded-[32px]">
          <h3 className="text-xl font-bold text-[#0F6E56] mb-4">Key Insight: The 'Aha!' Moment</h3>
          <p className="text-[#04342C] leading-relaxed">
            Your onboarding shouldn't try to explain the whole product. It should focus exclusively on the single action that delivers the most value to the user. For Slack, it was sending a message. For Dropbox, it was uploading a file. What's yours?
          </p>
        </div>

        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">The 6-Step Sequence Framework</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-6">
          A successful sequence follows a specific emotional arc:
        </p>
        <ul className="space-y-6 mb-12">
          <li className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#04342C] text-white flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <h4 className="font-bold text-[#0e0e10]">The Welcome & Hook</h4>
              <p className="text-[#5F5E5A]">Set expectations and provide immediate access to the core feature.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#04342C] text-white flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <h4 className="font-bold text-[#0e0e10]">The Activation Nudge</h4>
              <p className="text-[#5F5E5A]">Gently guide them toward their first meaningful action.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#04342C] text-white flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <h4 className="font-bold text-[#0e0e10]">The Value Deep Dive</h4>
              <p className="text-[#5F5E5A]">Showcase a secondary feature that increases 'stickiness'.</p>
            </div>
          </li>
        </ul>

        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">Why Foundation Matters</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          The best copy in the world won't save a broken technical setup. Ensure your webhooks are reliable and your delivery is through a trusted provider like Resend. Consistency in your voice and the reliability of your notifications build trust faster than any sales pitch.
        </p>
      </>
    )
  },
  'reduce-activation-gap': {
    title: "How to Reduce SaaS Activation Gap in 30 Days",
    type: "Tutorial",
    date: "March 14, 2026",
    readTime: "8 min read",
    author: "Sendrix Growth",
    intro: "A step-by-step strategy for increasing your day-30 retention through smart automation and value-focused nudges.",
    content: (
      <>
        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">Identifying the Gap</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          The 'Activation Gap' is the distance between a user signing up and that user performing a 'key event' that signals they are finding value. For most SaaS companies, 40-60% of users fall into this gap and never emerge. To fix this, you need to track your data and respond in real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <div className="p-8 bg-white border border-[#D3D1C7] rounded-[32px]">
            <Target className="text-[#1D4ED8] mb-4" size={32} />
            <h4 className="font-bold text-[#0e0e10] mb-2">Step 1: Define Your Event</h4>
            <p className="text-sm text-[#5F5E5A]">Identify the single most correlated metric with long-term retention.</p>
          </div>
          <div className="p-8 bg-white border border-[#D3D1C7] rounded-[32px]">
            <Zap className="text-[#1D4ED8] mb-4" size={32} />
            <h4 className="font-bold text-[#0e0e10] mb-2">Step 2: Trigger Automatically</h4>
            <p className="text-sm text-[#5F5E5A]">Don't wait 24 hours. Send a nudge within 30 minutes of missed milestones.</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-[#0e0e10] mb-4">Tactical Nudges that Work</h3>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          Instead of generic "We miss you" emails, try outcome-based nudges: "You're 1 step away from your first report" or "Here's what [Similar User] did next." These contextual prompts have 3x the click-through rates of standard templates.
        </p>

        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">Iteration is Key</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          Growth is rarely a linear path. Set up your sequences with Sendrix, monitor the activity logs for a week, and then refine your copy based on where users are dropping off. The data will tell you exactly where the friction is.
        </p>
      </>
    )
  },
  'product-launch-strategy': {
    title: "Product Launch Email Strategy for Indie Hackers",
    type: "Strategy",
    date: "March 15, 2026",
    readTime: "10 min read",
    author: "Founder Insights",
    intro: "How to leverage your Product Hunt launch for maximum email conversion and long-term user retention.",
    content: (
      <>
        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">The Launch Day Deluge</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          Launching on Product Hunt or Hacker News can send thousands of visitors your way in hours. But 90% of those visitors will forget you by tomorrow if you don't capture them. Your email strategy needs to be ready *before* the traffic hits.
        </p>

        <div className="my-12 flex flex-col md:flex-row gap-12 items-center">
          <div className="shrink-0 w-24 h-24 rounded-full bg-[#FAF0D8] flex items-center justify-center text-[#BA7517]">
            <Rocket size={48} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0e0e10] mb-2">The 'Launch Special' Nudge</h3>
            <p className="text-[#5F5E5A] leading-relaxed">
              Create a sequence specifically for launch day signups. Mention the platform where they found you to maintain the context. "Welcome from Product Hunt! As a special thanks..."
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-[#0e0e10] mb-4">Capturing High Intent</h3>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          Launch day users are often looking for the 'next big thing'. They want to see your roadmap, your vision, and why you're different from the incumbents. Use your Day 2 and Day 4 emails to tell your story, not just list features.
        </p>

        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">Building a Waitlist That Converts</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          If your product isn't quite ready for a full public release, use a high-converting waitlist sequence. Sendrix can automate the weekly updates that keep your waitlisted fans engaged until you're ready to flip the switch to paid plans.
        </p>
      </>
    )
  },
  'webhook-integration-guide': {
    title: "Webhook Email Integration: A Developer's Guide",
    type: "Technical",
    date: "March 16, 2026",
    readTime: "15 min read",
    author: "Sendrix Dev",
    intro: "Mastering the technical side of automated delivery, payload security, and real-time enrollment triggers.",
    content: (
      <>
        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">Why Webhooks Over SDKs?</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          While SDKs are easy to get started with, they often add bloat and can become stale. Webhooks are universal, lightweight, and language-agnostic. Triggering a Sendrix sequence is as simple as a single POST request to our API endpoint.
        </p>

        <div className="my-12 p-8 bg-[#04342C] text-white rounded-[32px] font-mono text-sm overflow-x-auto">
          <pre>{`fetch('https://sendrix.in/api/v1/enroll', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Sendrix-Secret': process.env.SENDRIX_SECRET
  },
  body: JSON.stringify({
    email: 'new-user@company.com',
    sequence_id: 'seq_abc123',
    properties: {
      name: 'Arjun',
      plan: 'pro'
    }
  })
})`}</pre>
        </div>

        <h3 className="text-2xl font-bold text-[#0e0e10] mb-4">Security & Reliability</h3>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          Always use HMAC-SHA256 signatures for your webhooks to ensure requests are coming from a trusted source. Sendrix supports secret keys and provides detailed error logging for every failed delivery attempt, so you never lose a user in the process.
        </p>

        <h2 className="text-3xl font-black text-[#0e0e10] mb-6">Handling Edge Cases</h2>
        <p className="text-lg text-[#5F5E5A] leading-relaxed mb-8">
          What happens if a user signs up twice? Or if they upgrade before the sequence finishes? Use our dynamic de-enrollment webhooks to stop onboarding sequences the moment a user takes the desired action. This ensures your emails always remain relevant and never feel like spam.
        </p>
      </>
    )
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS[params.slug as keyof typeof BLOG_POSTS]

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <Navbar />
      
      <main className="flex-1 px-6 pt-32 pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#888780] hover:text-[#0e0e10] transition-colors mb-12 text-sm font-medium group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-white border border-[#D3D1C7] text-[#0F6E56] text-[10px] font-bold uppercase tracking-widest">
                {post.type}
              </span>
              <span className="text-[#888780] text-sm">•</span>
              <span className="flex items-center gap-1.5 text-[#888780] text-sm">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#0e0e10] mb-8 leading-[1.05] tracking-tight">
              {post.title}
            </h1>
            <p className="text-xl text-[#5F5E5A] leading-relaxed italic border-l-4 border-[#1D9E75] pl-6 py-2">
              {post.intro}
            </p>
          </header>

          {/* Meta */}
          <div className="flex items-center justify-between py-8 border-y border-[#D3D1C7] mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#04342C] overflow-hidden flex items-center justify-center text-white font-bold text-xs uppercase">
                {post.author.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-[#0e0e10]">{post.author}</div>
                <div className="text-xs text-[#888780]">Growth & Strategy</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 text-[#888780] text-xs">
                <Calendar size={14} />
                {post.date}
              </div>
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-[#0e0e10] prose-p:text-[#5F5E5A] prose-p:leading-relaxed prose-p:text-lg">
            {post.content}
          </article>

          {/* Footer CTA */}
          <section className="mt-24 p-12 bg-[#04342C] rounded-[48px] text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1D9E75]/10 blur-[100px] rounded-full pointer-events-none"></div>
            <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Stop losing users at the finish line.</h2>
            <p className="text-white/60 mb-10 max-w-lg mx-auto relative z-10">
              Implement these strategies today with Sendrix's AI-powered onboarding automation.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-[#EF9F27] text-[#04342C] font-black rounded-2xl hover:bg-[#f5a82e] transition-all hover:scale-105 active:scale-95 shadow-xl relative z-10">
              Start Your 10-Minute Setup <ArrowRight size={20} />
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
