'use client'

import React, { useState } from 'react'
import { Check, Star, Zap, Mail, ArrowRight, PenTool, Users, Code2, ChevronDown } from 'lucide-react'

export default function TemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState(1);
  const [showCode, setShowCode] = useState<number | null>(null);

  const templates = [
    {
      id: 1,
      name: 'Clean Minimal',
      desc: 'Forest green header, generous white space, serif headline',
      tag: 'Light mode',
      tagIcon: <Check size={10} />,
      recommended: true
    },
    {
      id: 2,
      name: 'Editorial Bold',
      desc: 'Dark mode, amber accents, high contrast — built for impact',
      tag: 'Dark mode',
      tagIcon: null,
      highImpact: true
    },
    {
      id: 3,
      name: 'Warm Editorial',
      desc: 'Cream background, amber gradient stripe, personal tone',
      tag: 'Light warm',
      tagIcon: <Zap size={10} className="fill-amber-500" />,
      personalTone: true
    }
  ];

  const toggleCode = (id: number) => {
    setShowCode(showCode === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#111] font-sans text-white selection:bg-[#E1F5EE] selection:text-[#04342C]">
      {/* ── PAGE CHROME ── */}
      <header className="bg-[#0a0a0a] border-b border-[#222] px-8 h-[52px] flex items-center justify-between sticky top-0 z-[100]">
        <a className="flex items-center gap-2 text-decoration-none" href="/">
          <div className="w-7 h-7 rounded-lg bg-[#04342C] flex items-center justify-center font-serif text-sm text-white">S</div>
          <span className="text-base font-semibold text-white tracking-tight">sendrix</span>
        </a>
        <span className="font-mono text-[11px] color-[#555] tracking-widest uppercase">EMAIL TEMPLATES · v1.0</span>
      </header>

      {/* ── HERO ── */}
      <div className="text-center py-14 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#0F6E56] tracking-widest uppercase bg-[#04342c]/30 border border-[#0f6e56]/30 rounded-full px-3.5 py-1 mb-4">
          <span className="w-1 h-1 rounded-full bg-[#0F6E56] animate-pulse"></span>
          3 templates included
        </div>
        <h1 className="font-serif text-[clamp(32px,4vw,46px)] text-white tracking-tight leading-none mb-3">
          Choose your email <em className="italic text-[#EF9F27] not-italic">template.</em>
        </h1>
        <p className="text-[15px] text-[#666] max-w-[420px] mx-auto leading-relaxed">
          Every template works with all 6 email types. Switch anytime from your workspace settings.
        </p>
      </div>

      {/* ── TEMPLATE SELECTOR CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[1100px] mx-auto px-6 mb-4">
        {templates.map(t => (
          <div 
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className={`bg-[#1a1a1a] border rounded-xl p-4 cursor-pointer transition-all hover:border-[#444] hover:-translate-y-0.5 flex flex-col gap-2.5 ${activeTemplate === t.id ? 'border-[#EF9F27] bg-[#1e1a0f]' : 'border-[#2a2a2a]'}`}
          >
            <div className={`h-[80px] rounded-lg overflow-hidden relative ${t.id === 1 ? 'bg-[#04342C]' : t.id === 2 ? 'bg-[#0e0e10] border border-[#2a2a2a]' : 'bg-[#fffef9]'}`}>
               {/* Preview elements simplified for cards */}
               {t.id === 1 && <div className="p-3 opacity-20"><div className="h-1.5 w-1/2 bg-white rounded mb-1.5"></div><div className="h-1 w-full bg-white rounded mb-1"></div><div className="h-1 w-[80%] bg-white rounded"></div></div>}
               {t.id === 2 && <div className="p-3 opacity-20"><div className="h-1 w-1/3 bg-[#EF9F27] rounded mb-1.5"></div><div className="h-1 w-full bg-white rounded mb-1"></div><div className="h-2 w-1/4 bg-[#EF9F27] rounded mt-2"></div></div>}
               {t.id === 3 && <div className="p-3 opacity-20"><div className="h-0.5 w-full bg-[#EF9F27] mb-1.5"></div><div className="h-1 w-2/3 bg-black rounded mb-1"></div><div className="h-1 w-full bg-black rounded"></div></div>}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-[#555] leading-normal">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── STAGE ── */}
      <div className="max-w-[1100px] mx-auto px-6 py-8 pb-14">
        {templates.filter(t => t.id === activeTemplate).map(t => (
          <div key={t.id} className="animate-in fade-in slide-in-from-bottom-3 duration-350">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="text-xl font-semibold text-white tracking-tight mb-1">Template {t.id} — {t.name}</div>
                <div className="text-sm text-[#555]">Best for {t.id === 1 ? 'professional SaaS tools, B2B products' : t.id === 2 ? 'consumer apps, creator tools' : 'founder-led products, coaching tools'}</div>
              </div>
              <div className="flex gap-2">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full border ${t.id === 2 ? 'bg-[#111] text-[#555] border-[#222]' : 'bg-[#04342c]/30 text-[#0F6E56] border-[#0f6e56]/30'}`}>
                  {t.tagIcon}{t.tag}
                </span>
                {t.recommended && <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full bg-[#EF9F27]/10 text-[#EF9F27] border border-[#ef9f27]/30">
                  <Star size={10} />Recommended
                </span>}
                {t.highImpact && <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full bg-[#EF9F27]/10 text-[#EF9F27] border border-[#ef9f27]/30">
                  <Zap size={10} />High impact
                </span>}
                {t.personalTone && <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold font-mono px-2.5 py-1 rounded-full bg-[#EF9F27]/10 text-[#EF9F27] border border-[#ef9f27]/30">
                   <Users size={10} />Personal tone
                </span>}
              </div>
            </div>

            {/* Email Frame */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden mb-5">
              <div className="bg-[#141414] border-b border-[#222] px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="flex-1 bg-[#1f1f1f] border border-[#2a2a2a] rounded-md py-1 px-2.5 font-mono text-[11px] text-[#555] text-center">
                  {t.id === 1 ? 'Day 0 · Welcome email — Invoicely' : t.id === 2 ? 'Day 1 · Activation nudge — TaskFlow' : 'Day 5 · Social proof — WriteWise'}
                </div>
              </div>
              
              <div className={`p-8 md:p-12 ${t.id === 2 ? 'bg-[#1a1a1a]' : t.id === 3 ? 'bg-[#ede9e1]' : 'bg-[#f8f7f4]'}`}>
                {/* Embedded Template Previews */}
                {t.id === 1 && (
                  <div className="font-sans max-w-[580px] mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-[#04342C] p-6 md:p-8 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2 font-semibold">
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-serif">I</div>
                        Invoicely
                      </div>
                      <span className="font-mono text-[10px] opacity-50 tracking-widest">DAY 0 · WELCOME</span>
                    </div>
                    <div className="p-9 md:p-12">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-xs font-semibold mb-3">
                        <Mail size={10} />Welcome aboard
                      </div>
                      <div className="text-sm text-[#888] mb-2">Hey Arjun,</div>
                      <h2 className="font-serif text-[28px] text-[#0e0e10] leading-tight tracking-tight mb-4">You just made invoicing<br/>a lot simpler.</h2>
                      <div className="w-8 h-[2px] bg-[#04342C] mb-5"></div>
                      <p className="text-[15px] text-[#5F5E5A] leading-relaxed mb-4">Welcome to Invoicely. You&apos;ve joined 2,400+ freelancers who&apos;ve stopped chasing payments and started getting paid on time.</p>
                      <div className="my-7">
                        <a href="#" className="inline-block bg-[#04342C] text-white px-7 py-3 rounded-lg text-sm font-semibold">Send your first invoice →</a>
                      </div>
                      <p className="text-sm text-[#aaa]">If you have any questions, just reply to this email.</p>
                      <p className="text-sm text-[#888] mt-5">— Alex<br/><span className="text-[#bbb] text-xs">Founder, Invoicely</span></p>
                    </div>
                    <div className="bg-[#f5f3ec] p-5 px-9 md:px-12 border-t border-[#e8e5de]">
                      <p className="text-[11px] text-[#aaa] leading-relaxed">
                        You received this because you signed up at invoicely.com · <a href="#" className="underline">Unsubscribe</a><br/>
                        Invoicely · 123 Anna Salai, Chennai, TN 600002
                      </p>
                    </div>
                  </div>
                )}

                {t.id === 2 && (
                   <div className="max-w-[580px] mx-auto bg-[#0e0e10] rounded-lg overflow-hidden shadow-2xl font-['Sora',sans-serif]">
                    <div className="p-7 px-9 pb-0">
                      <div className="flex items-center justify-between mb-7">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#EF9F27]"></div>
                          <span className="text-sm font-semibold text-white">TaskFlow</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#444] tracking-widest">EMAIL 02 / 06</span>
                      </div>
                      <div className="bg-[#171717] rounded-xl p-7">
                        <div className="flex items-center gap-2 text-[#EF9F27] font-mono text-[10px] uppercase tracking-widest mb-3">
                          <div className="w-4 h-px bg-[#EF9F27]"></div> Day 1 · Activation
                        </div>
                        <h2 className="text-[26px] font-bold text-white leading-tight tracking-tight">You haven&apos;t created <br/>your first task <em className="italic text-[#EF9F27] not-italic">yet.</em></h2>
                      </div>
                    </div>
                    <div className="p-9 pt-6">
                      <p className="text-sm text-[#888] leading-relaxed mb-4">Hey Priya — you signed up yesterday. But your project is still empty.</p>
                      <div className="flex flex-col gap-2.5 my-5">
                        <div className="flex gap-3 bg-[#171717] border border-[#222] p-3 rounded-lg items-center">
                          <div className="w-5.5 h-5.5 rounded-full bg-[#EF9F27] text-[#0e0e10] flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                          <div className="text-xs text-[#aaa]"><strong>Create a project</strong> — name it anything.</div>
                        </div>
                      </div>
                      <div className="mt-5">
                        <a href="#" className="inline-flex items-center gap-2 bg-[#EF9F27] text-[#0e0e10] px-6 py-3 rounded-lg text-sm font-bold">
                          Create your project <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>
                    <div className="border-t border-[#1e1e1e] p-4.5 px-9">
                      <p className="text-[10px] text-[#444]">
                        You signed up at taskflow.app · <a href="#" className="underline">Unsubscribe</a>
                      </p>
                    </div>
                  </div>
                )}

                {t.id === 3 && (
                  <div className="max-w-[580px] mx-auto bg-[#fffef9] rounded-lg overflow-hidden shadow-lg font-sans">
                    <div className="h-1 bg-gradient-to-r from-[#EF9F27] to-[#04342C]"></div>
                    <div className="p-7 px-10 py-5 flex items-center justify-between border-b border-[#f0ede6]">
                       <div className="flex items-center gap-2 font-semibold">
                        <div className="w-6.5 h-6.5 rounded-lg bg-[#04342C] flex items-center justify-center text-white text-xs font-serif">W</div>
                        WriteWise
                      </div>
                      <span className="font-mono text-[11px] text-[#bbb]">MARCH 2025</span>
                    </div>
                    <div className="p-9 px-10">
                      <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 rounded-full bg-[#04342C] flex items-center justify-center text-white font-bold text-sm">S</div>
                        <div>
                          <div className="text-xs font-bold">Sanjay from WriteWise</div>
                          <div className="text-[10px] text-[#bbb]">Founder · hello@writewise.in</div>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF0D8] border border-[#f0d090] text-[#BA7517] text-[10px] font-mono font-bold tracking-wider mb-4 uppercase">
                        <Users size={10} /> Day 5 · Social proof
                      </div>
                      <h2 className="font-[&apos;Playfair_Display&apos;,serif] text-[28px] text-[#0e0e10] leading-tight mb-5 italic">How Meera writes <span className="text-[#04342C]">30 blog posts</span> a month.</h2>
                      <p className="text-[15px] text-[#5F5E5A] leading-relaxed mb-3">Hey Rahul, Meera was spending 4 hours on every blog post. Now she does the thinking — WriteWise does the writing.</p>
                      <div className="border-l-[3px] border-[#EF9F27] bg-[#FAF0D8] p-4 px-5 rounded-r-lg my-6 italic text-sm text-[#BA7517]">
                        &quot;I thought AI writing would feel robotic. But my clients can&apos;t tell the difference.&quot;
                      </div>
                      <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl p-5 px-6 flex items-center justify-between gap-4 my-6">
                        <div>
                          <div className="text-sm font-bold text-[#04342C]">Write your first draft now</div>
                          <div className="text-xs text-[#0F6E56] opacity-70">Takes 30 seconds.</div>
                        </div>
                        <a href="#" className="bg-[#04342C] text-white px-5 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
                          <PenTool size={13} /> Start writing
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => toggleCode(t.id)}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm font-medium text-[#666] hover:text-[#aaa] hover:border-[#444] transition-all"
            >
              <Code2 size={14} /> View HTML source
              <ChevronDown size={14} className={`transition-transform duration-200 ${showCode === t.id ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-3 transition-all duration-300 overflow-hidden ${showCode === t.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
               <pre className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-5 text-[11px] font-mono text-[#888] overflow-x-auto leading-relaxed">
{`<!-- Template ${t.id}: ${t.name} -->
<!-- Use this structure in your resend sequence dashboard -->

<table width="600" cellpadding="0" cellspacing="0" style="margin: 0 auto; font-family: sans-serif;">
  <tr>
    <td style="padding: 24px 32px; background: ${t.id === 1 ? '#04342C' : t.id === 2 ? '#0e0e10' : '#fffef9'}; color: ${t.id === 2 ? '#fff' : '#0e0e10'};">
      <h1 style="font-size: 16px;">{{product_name}}</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 40px; background: ${t.id === 2 ? '#0e0e10' : '#ffffff'};">
      <h2 style="font-size: 28px; color: ${t.id === 2 ? '#fff' : '#0e0e10'};">{{headline}}</h2>
      <p style="color: #555; line-height: 1.7;">{{body_content}}</p>
      <a href="{{cta_url}}" style="display:inline-block; background: ${t.id === 2 ? '#EF9F27' : '#04342C'}; color: ${t.id === 2 ? '#0e0e10' : '#fff'}; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
        {{cta_text}}
      </a>
    </td>
  </tr>
</table>`}
               </pre>
            </div>
          </div>
        ))}
      </div>

      <footer className="bg-[#0a0a0a] border-t border-[#1e1e1e] py-6 px-8 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#444] font-mono">sendrix.in · email templates v1.0</span>
        <span className="text-xs text-[#333]">All templates are mobile-responsive and inbox-tested</span>
      </footer>
    </div>
  );
}
