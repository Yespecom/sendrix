'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Zap, Tag, BookOpen, LifeBuoy, ArrowRight, Sparkles, Calendar, 
  CalendarRange, Leaf, Award, Rocket, Star, Lock, TrendingDown, 
  Check, X, Shield, Infinity, RefreshCw, UserPlus, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { Plan, PLAN_CONFIG } from '@/lib/plans'

const PLAN_SELECTION_MAP: Record<string, string> = {
  starter: 'free',
  indie: 'founding',
  pro: 'pro',
}

export default function WorkspaceSelectPlans() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectPlan = async (planKey: string) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedPlan: PLAN_SELECTION_MAP[planKey] }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Could not confirm your plan selection.')
      }

      router.push('/app/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plan update failed.')
      setIsSubmitting(false)
    }
  }

  const foundingPrice = billing === 'monthly' ? 999 : 799
  const proPrice = billing === 'monthly' ? 2999 : 2399

  return (
    <div className="min-h-screen bg-[#F5F3EC] font-sans text-[#0e0e10] antialiased selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
        @keyframes priceIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes savePop { 0% { transform: scale(.8); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes saveGlow { 0% { box-shadow: 0 0 0 0 rgba(239, 159, 39, .6); } 70% { box-shadow: 0 0 0 12px rgba(239, 159, 39, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 159, 39, 0); } }
      `}</style>

      <div className="text-center pt-20 pb-14 px-6 bg-white border-b border-[#D3D1C7] animate-[fadeUp_0.4s_ease_both]">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-medium text-[#0F6E56] tracking-[0.12em] uppercase bg-[#E1F5EE] border border-[#9FE1CB] rounded-[20px] px-3.5 py-1.5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-[pulse_2s_ease_infinite]"></span>
          <span>Early access · 47 of 100 spots claimed</span>
        </div>
        <h1 className="font-serif text-[clamp(36px,5vw,52px)] text-[#0e0e10] tracking-[-0.8px] leading-[1.08] mb-3.5">
          Choose your journey.<br /><em className="italic text-[#04342C]">Launch your workspace.</em>
        </h1>
        <p className="text-lg text-[#5F5E5A] max-w-[480px] mx-auto leading-[1.65] mb-8">Select a plan to activate your automated onboarding sequences.</p>

        <div className="flex items-center justify-center gap-3">
          <div className="inline-flex items-center bg-[#F5F3EC] border-[1.5px] border-[#D3D1C7] rounded-[40px] p-1">
            <button 
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-[30px] text-sm font-semibold cursor-pointer transition-all flex items-center gap-1.5 border-none ${billing === 'monthly' ? 'bg-white text-[#0e0e10] shadow-[0_1px_4px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#888780]'}`}
            >
              <Calendar size={13} />Monthly
            </button>
            <button 
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-[30px] text-sm font-semibold cursor-pointer transition-all flex items-center gap-1.5 border-none ${billing === 'yearly' ? 'bg-white text-[#0e0e10] shadow-[0_1px_4px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent text-[#888780]'}`}
            >
              <CalendarRange size={13} />Yearly
            </button>
          </div>
          <div className={`inline-flex items-center gap-1.5 bg-[#EF9F27] text-[#03261F] font-mono text-sm font-bold px-4 py-2 rounded-[24px] border-2 border-[#BA7517] transition-all ${billing === 'yearly' ? 'animate-[savePop_0.35s_cubic-bezier(.4,0,.2,1)_forwards,saveGlow_0.7s_ease_0.1s] scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
            <Sparkles size={14} />Save 20%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1040px] mx-auto px-6 pt-14 pb-20">
        {/* FREE */}
        <div className="bg-white border border-[#D3D1C7] rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(4,52,44,0.1)] animate-[fadeUp_0.45s_ease_both]">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D3D1C7]"></div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-[#f0ede6] flex items-center justify-center shrink-0">
              <Leaf size={20} className="text-[#888780]" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#888780] uppercase tracking-[0.1em]">Starter</div>
              <div className="text-[11px] text-[#D3D1C7] font-medium">Free forever</div>
            </div>
          </div>
          <p className="text-[13px] text-[#5F5E5A] leading-[1.55] mb-0">For founders exploring the product. No credit card needed.</p>
          <div className="py-4 my-3.5 border-y border-[#f0ede6]">
            <div className="flex items-baseline gap-[3px]">
              <span className="font-serif text-[40px] text-[#0e0e10] tracking-[-0.5px]">Free</span>
            </div>
          </div>
          <div className="flex-1 mb-6 space-y-2">
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Generation <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>1 workspace</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>3 AI generations / mo</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>Resend integration</strong></span></div>
          </div>
          <button 
            onClick={() => handleSelectPlan('starter')}
            disabled={isSubmitting}
            className="w-full p-[13px] rounded-lg text-[15px] font-semibold border-[1.5px] border-[#D3D1C7] text-[#5F5E5A] bg-transparent cursor-pointer transition-all hover:border-[#0F6E56] hover:text-[#04342C] hover:bg-[#E1F5EE] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={15} />Get started free
          </button>
        </div>

        {/* FOUNDING MEMBER */}
        <div className="bg-white border-2 border-[#04342C] rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(4,52,44,0.18)] shadow-[0_4px_24px_rgba(4,52,44,0.12)] animate-[fadeUp_0.52s_ease_both]">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#04342C]"></div>
          <div className="absolute top-[18px] right-[18px] bg-[#04342C] text-white font-mono text-[10px] font-medium tracking-[0.08em] uppercase px-2.5 py-1 rounded-[20px] flex items-center gap-1"><Star size={10} className="fill-white" />Most popular</div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-[#E1F5EE] flex items-center justify-center shrink-0">
              <Award size={20} className="text-[#0F6E56]" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#0F6E56] uppercase tracking-[0.1em]">Founding Member</div>

            </div>
          </div>
          <p className="text-[13px] text-[#5F5E5A] leading-[1.55] mb-0">For active founders with a live product. Locked in at launch price.</p>
          <div className="py-4 my-3.5 border-y border-[#f0ede6]">
            <div className="flex items-baseline gap-[3px]">
              <span className="text-[20px] font-semibold">₹</span>
              <span className="font-serif text-[48px] tracking-[-1.5px] leading-none animate-[priceIn_0.22s_ease]">{foundingPrice}</span>
              <span className="text-[14px] text-[#888780] ml-0.5">/mo</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5 min-h-[22px]">
              <span className="text-[12px] text-[#888780] flex items-center gap-1"><Lock size={11} />{billing === 'monthly' ? 'Billed monthly · locked' : `Billed ₹${(foundingPrice * 12).toLocaleString()}/yr`}</span>
              {billing === 'yearly' && (
                 <span className="text-[11px] font-bold px-2 py-0.5 rounded-[10px] bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB] flex items-center gap-1 animate-[savePop_0.35s_cubic-bezier(.4,0,.2,1)]"><TrendingDown size={10} />Save ₹2,400/yr</span>
              )}
            </div>
          </div>
          <div className="flex-1 mb-6 space-y-2">
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Generation <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>3 workspaces</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>20 AI generations / mo</strong></span></div>
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Delivery <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>Resend integration + Analytics</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>Price locked forever</strong></span></div>
          </div>
          <button 
            onClick={() => handleSelectPlan('indie')}
            disabled={isSubmitting}
            className="w-full p-[13px] rounded-lg text-[15px] font-semibold bg-[#04342C] text-white border-none cursor-pointer transition-all hover:bg-[#03261F] hover:-translate-y-[1px] shadow-[0_2px_10px_rgba(4,52,44,0.22)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Award size={15} />Claim founding price →
          </button>
        </div>

        {/* PRO */}
        <div className="bg-white border border-[#D3D1C7] rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(4,52,44,0.1)] animate-[fadeUp_0.59s_ease_both]">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#EF9F27]"></div>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-[#FAF0D8] flex items-center justify-center shrink-0">
              <Rocket size={20} className="text-[#BA7517]" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#BA7517] uppercase tracking-[0.1em]">Pro</div>
              <div className="text-[11px] text-[#BA7517]/60 font-medium">For agencies</div>
            </div>
          </div>
          <p className="text-[13px] text-[#5F5E5A] leading-[1.55] mb-0">Unlimited everything. Agency grade delivery and analytics.</p>
          <div className="py-4 my-3.5 border-y border-[#f0ede6]">
            <div className="flex items-baseline gap-[3px]">
              <span className="text-[20px] font-semibold">₹</span>
              <span className="font-serif text-[48px] tracking-[-1.5px] leading-none animate-[priceIn_0.22s_ease]">{proPrice}</span>
              <span className="text-[14px] text-[#888780] ml-0.5">/mo</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5 min-h-[22px]">
              <span className="text-[12px] text-[#888780] flex items-center gap-1"><RefreshCw size={11} />{billing === 'monthly' ? 'Billed monthly' : `Billed ₹${(proPrice * 12).toLocaleString()}/yr`}</span>
              {billing === 'yearly' && (
                 <span className="text-[11px] font-bold px-2 py-0.5 rounded-[10px] bg-[#FAF0D8] text-[#BA7517] border border-[#f0d090] flex items-center gap-1 animate-[savePop_0.35s_cubic-bezier(.4,0,.2,1)]"><TrendingDown size={10} />Save ₹7,200/yr</span>
              )}
            </div>
          </div>
          <div className="flex-1 mb-6 space-y-2">
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Unlimited everything <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#FAF0D8] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#BA7517]" /></div><span><strong>Unlimited workspaces</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#FAF0D8] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#BA7517]" /></div><span><strong>A/B subject line testing</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#FAF0D8] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#BA7517]" /></div><span><strong>Agency grade delivery</strong></span></div>
          </div>
          <button 
            onClick={() => handleSelectPlan('pro')}
            disabled={isSubmitting}
            className="w-full p-[13px] rounded-lg text-[15px] font-semibold bg-[#EF9F27] text-[#04342C] border-none cursor-pointer transition-all hover:bg-[#f5a82e] hover:-translate-y-[1px] shadow-[0_2px_10px_rgba(239,159,39,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Rocket size={15} />Get Pro access →
          </button>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-full px-4">
          <div className="bg-[#FEF2F2] border border-[#FDD7C3] p-4 rounded-xl text-sm font-bold text-[#D85A30] shadow-2xl flex items-center gap-2 animate-[fadeUp_0.3s_ease]">
             <CheckCircle size={16} className="text-[#D85A30]" />
             {error}
          </div>
        </div>
      )}

      <div className="bg-[#04342C] py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="relative max-w-[520px] mx-auto text-white">
          <h2 className="font-serif text-[32px] tracking-[-0.5px] mb-3 leading-[1.1]">Join 47 founders already automating their onboarding.</h2>
          <div className="text-[12px] opacity-30 text-center mt-3.5 flex items-center justify-center gap-1.5"><Shield size={12} className="stroke-white" />Premium support included on all paid plans.</div>
        </div>
      </div>
    </div>
  )
}
