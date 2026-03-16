export default function Testimonials() {
  const reviews = [
    { name: "Alex Chen", role: "Indie Hacker", quote: "Sendrix essentially replaced a $4k/mo copywriter for my SaaS. The activation rates are honestly better." },
    { name: "Sarah Jenkins", role: "Founder, Invoicely", quote: "I was procrastinating on my onboarding emails for months. With Sendrix, it was done and converting before lunch." },
    { name: "Michael T", role: "Creator", quote: "The webhook integration is genius. I didn't have to fiddle with Zapier or Make at all to get this running." }
  ]

  return (
    <section className="py-24 px-6 bg-[#F5F3EC]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-[#0e0e10] text-center mb-12">Trusted by 100+ founders.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-[#D3D1C7] hover:border-[#0F6E56]/40 transition-colors">
              <div className="flex gap-1 mb-4 text-[#EF9F27]">
                {'★★★★★'}
              </div>
              <p className="text-[#0e0e10] font-medium leading-relaxed mb-6">&ldquo;{r.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 bg-[#E1F5EE] rounded-full flex items-center justify-center font-bold text-[#04342C]">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0e0e10]">{r.name}</div>
                  <div className="text-xs font-semibold text-[#888780]">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm font-normal normal-case tracking-normal font-sans text-[#2C2C2C] mt-10">
          Powered by{' '}
          <a
            href="https://linklane.in/sendrix"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#0e0e10] hover:underline"
          >
            Linklane.in
          </a>
        </p>
      </div>
    </section>
  )
}
