import { Zap, Clock, TrendingUp, Lock, RefreshCcw, Headset } from 'lucide-react'

export default function PerksSection() {
  const perks = [
    { icon: Zap, title: "Written in 8 seconds", desc: "No more staring at a blank page. Sendrix AI generates a full sequence customized to your app." },
    { icon: TrendingUp, title: "Optimized for conversions", desc: "Templates based on SaaS onboarding that drove over $100M in ARR." },
    { icon: RefreshCcw, title: "Auto-delivered", desc: "Just add one webhook to your signup flow. Sendrix handles the scheduling and sending via Resend." },
    { icon: Lock, title: "Locked-in pricing", desc: "Founding members keep their $19/mo pricing forever. No sneaky hikes." },
    { icon: Clock, title: "Set and forget", desc: "Edit once, run forever. Focus on building product instead of writing emails." },
    { icon: Headset, title: "Founder-led support", desc: "Direct access to me for copy review and technical integration help." }
  ]

  return (
    <section className="bg-[#04342C] text-[#E1F5EE] py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-16">Why become a Founding Member?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk, i) => (
            <div key={i} className="bg-[#03261F] border border-white/10 p-6 rounded-2xl hover:border-[#EF9F27]/50 transition-colors">
              <perk.icon className="w-8 h-8 text-[#EF9F27] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{perk.title}</h3>
              <p className="text-[#888780] leading-relaxed text-sm">{perk.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
