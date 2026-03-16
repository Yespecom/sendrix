export default function HowItWorks() {
  return (
    <section className="py-28 px-6 bg-[#0e0e10]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#1D9E75] text-xs font-bold uppercase tracking-wider mb-6">
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            From product hunt launch to live sequence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D9E75] to-[#EF9F27]">in 10 minutes.</span>
          </h2>
          <p className="text-[#888780] text-lg max-w-xl mx-auto">No manual email writing. The ultimate AI email writer for SaaS founders and indie hackers.</p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Step 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#1D9E75]/40 transition-all">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#1D9E75]/20 border border-[#1D9E75]/30 flex items-center justify-center text-[#1D9E75] text-xs font-black">01</div>
                <div className="text-xs font-bold text-[#888780] uppercase tracking-wider">Fill the brief</div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Describe your product</h3>
              <p className="text-[#888780] text-sm leading-relaxed">Tell us what your app does and who it's for. That's all Sendrix AI needs.</p>
            </div>
            {/* UI mockup: brief form */}
            <div className="p-5 bg-[#111311]">
              <div className="bg-[#0D1A14] rounded-xl border border-[#1D9E75]/20 p-4 text-left">
                <div className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-wider mb-3">Brief • Step 1 of 1</div>
                <div className="space-y-3">

                  <div>
                    <div className="text-[10px] text-[#5F5E5A] mb-1">What does it do?</div>
                    <div className="bg-[#04342C]/40 border border-[#1D9E75]/30 rounded-lg px-3 py-2 text-xs text-[#D3D1C7] leading-relaxed">Automated invoicing for freelancers. Send, track and get paid faster.</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5F5E5A] mb-1">Target user</div>
                    <div className="bg-[#04342C]/40 border border-[#1D9E75]/30 rounded-lg px-3 py-2 text-xs text-[#D3D1C7]">Freelancers & indie consultants</div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 bg-[#1D9E75] rounded-lg py-2 text-center text-xs font-bold text-white flex items-center justify-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Generate with AI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#EF9F27]/40 transition-all">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#EF9F27]/20 border border-[#EF9F27]/30 flex items-center justify-center text-[#EF9F27] text-xs font-black">02</div>
                <div className="text-xs font-bold text-[#888780] uppercase tracking-wider">AI writes it all</div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">6 emails in 8 seconds</h3>
              <p className="text-[#888780] text-sm leading-relaxed">Sendrix AI (Powered by Claude) crafts a full welcome sequence tailored to your product and audience.</p>
            </div>
            {/* UI mockup: email cards */}
            <div className="p-5 bg-[#111311] space-y-2">
              {[
                { day: 'Day 0', type: 'Welcome', subject: 'You\'re in — let\'s get you set up 🎉', color: '#1D9E75' },
                { day: 'Day 1', type: 'Activation', subject: 'The fastest way to send your first invoice', color: '#378ADD' },
                { day: 'Day 3', type: 'Value', subject: 'How top freelancers get paid 2× faster', color: '#7C3AED' },
              ].map((email, i) => (
                <div key={i} className="bg-[#0D1A14] border border-white/5 rounded-lg px-3 py-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ background: `${email.color}22`, border: `1px solid ${email.color}44` }}>
                    <div className="text-[8px] font-bold uppercase" style={{ color: email.color }}>{email.day.split(' ')[0]}</div>
                    <div className="text-sm font-black leading-none" style={{ color: email.color }}>{email.day.split(' ')[1]}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: email.color }}>{email.type}</div>
                    <div className="text-xs text-[#D3D1C7] truncate">{email.subject}</div>
                  </div>
                  <div className="ml-auto shrink-0 w-4 h-4 text-[#3a3a3a]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                </div>
              ))}
              <div className="text-center text-[10px] text-[#3a3a3a] pt-1">+3 more emails generated</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#D85A30]/40 transition-all">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#D85A30]/20 border border-[#D85A30]/30 flex items-center justify-center text-[#D85A30] text-xs font-black">03</div>
                <div className="text-xs font-bold text-[#888780] uppercase tracking-wider">Webhook API</div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Webhook Email Integration</h3>
              <p className="text-[#888780] text-sm leading-relaxed">Fastest webhook email trigger automation. Perfect for agency MVP delivery or indie hacker tools.</p>
            </div>
            {/* UI mockup: webhook + live activity */}
            <div className="p-5 bg-[#111311] space-y-3">
              <div className="bg-[#0D1A14] rounded-xl border border-white/5 p-3">
                <div className="text-[10px] text-[#5F5E5A] mb-1.5">Webhook endpoint</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/40 rounded-lg px-2.5 py-2 font-mono text-[10px] text-[#1D9E75] truncate">sendrix.io/api/webhook/xK91m...</div>
                  <div className="shrink-0 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-lg px-2 py-2 text-[10px] font-bold text-[#1D9E75]">Copy</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-[#5F5E5A] uppercase tracking-wider">Live enrollments</div>
                {[
                  { email: 'tom@framer.com', time: '2s ago', status: 'Enrolled' },
                  { email: 'sarah@linear.app', time: '4m ago', status: 'Day 1 sent' },
                  { email: 'dev@notion.so', time: '11m ago', status: 'Day 3 sent' },
                ].map((sub, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#04342C] to-[#1D9E75] shrink-0 flex items-center justify-center text-[8px] text-white font-black">
                      {sub.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-xs text-[#5F5E5A] truncate">{sub.email}</div>
                    <div className="text-[10px] font-bold text-[#1D9E75] shrink-0">{sub.status}</div>
                    <div className="text-[9px] text-[#3a3a3a] shrink-0">{sub.time}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <div className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse"></div>
                <div className="text-[10px] text-[#1D9E75] font-semibold">Sequence is live and enrolling users</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA nudge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 mx-auto">
            <div className="flex -space-x-2">
              {['#04342C','#1D9E75','#EF9F27','#D85A30'].map((c,i)=>(
                <div key={i} style={{ background: c }} className="w-8 h-8 rounded-full border-2 border-[#0e0e10] flex items-center justify-center text-white text-[10px] font-black">
                  {['J','S','M','L'][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-[#888780]">
              <span className="text-white font-semibold">68+ founders</span> already running AI sequences on their domain
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
