'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Zap, Tag, BookOpen, LifeBuoy, ArrowRight, Sparkles, Calendar, 
  CalendarRange, Leaf, Award, Rocket, Star, Lock, TrendingDown, 
  Check, X, Shield, Infinity, RefreshCw, UserPlus, CheckCircle,
  AlertTriangle, TrendingUp, ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRazorpay } from '@/hooks/useRazorpay'
import Navbar from '@/components/layout/Navbar'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import JsonLd from '@/components/JsonLd'

const PLAN_PRICES: Record<string, number> = { starter: 0, indie: 999, pro: 2999 }
const PLAN_PRICES_YEARLY: Record<string, number> = { starter: 0, indie: 799 * 12, pro: 2399 * 12 }

function getPlanKey(plan: string) {
  if (plan === 'founding') return 'indie'
  return plan
}


export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [curPlan, setCurPlan] = useState<string>('founding')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'downgrade' | 'upgrade'
    targetPlan: string
    proratedPrice: number | null
    fullPrice: number
  } | null>(null)
  const [toast, setToast] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', product: '' })
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [lastPaymentAt, setLastPaymentAt] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { processPayment } = useRazorpay()

  const isWithin10Days = useMemo(() => {
    if (!lastPaymentAt) return false
    const diff = Date.now() - new Date(lastPaymentAt).getTime()
    return diff <= 10 * 24 * 60 * 60 * 1000
  }, [lastPaymentAt])

  useEffect(() => {
    async function fetchUserData() {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/user/plan')
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              setFormData(prev => ({
                ...prev,
                name: data.user.name || session?.user?.name || '',
                email: data.user.email || session?.user?.email || ''
              }))
            }
            if (data.account) {
              setUserPlan(data.account.plan)
              setLastPaymentAt(data.account.lastPaymentAt)
            }
          }
        } catch (err) {
          console.error('Failed to fetch user data from DB:', err)
          // Fallback to session
          setFormData(prev => ({
            ...prev,
            name: session?.user?.name || '',
            email: session?.user?.email || ''
          }))
        }
      }
    }
    fetchUserData()
  }, [status, session])

  const showToast = (msg: string) => {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: '' }), 3200)
  }

  const handlePricingClick = async (plan: string) => {
    if (status === 'unauthenticated') {
      router.push(`/signup?plan=${plan}`)
      return
    }

    const currentPlanKey = getPlanKey(userPlan || 'starter')
    const targetPlanKey = getPlanKey(plan)
    const currentPrice = PLAN_PRICES[currentPlanKey] ?? 0
    const targetPrice = billing === 'yearly' ? (PLAN_PRICES_YEARLY[targetPlanKey] ?? PLAN_PRICES[targetPlanKey] ?? 0) : (PLAN_PRICES[targetPlanKey] ?? 0)
    const isDowngrade = targetPrice < currentPrice || (targetPlanKey === 'starter')
    const isUpgrade = targetPrice > currentPrice

    // DOWNGRADE: to free plan or to a lower paid plan
    if (plan === 'free' || isDowngrade) {
      if (currentPlanKey !== 'starter') {
        setConfirmDialog({
          open: true,
          type: 'downgrade',
          targetPlan: plan,
          proratedPrice: null,
          fullPrice: 0
        })
        return
      }
      // Already on starter, just proceed
      await doFreePlanSwitch()
      return
    }

    // UPGRADE: to a higher paid plan
    if (isUpgrade) {
      const proratedPrice = isWithin10Days ? Math.max(1, targetPrice - currentPrice) : null
      setConfirmDialog({
        open: true,
        type: 'upgrade',
        targetPlan: plan,
        proratedPrice,
        fullPrice: targetPrice
      })
      return
    }

    // Same tier or new purchase (no existing plan)
    setCurPlan(plan)
    setIsModalOpen(true)
  }

  const doFreePlanSwitch = async () => {
    setIsSubmitting(true)
    setConfirmDialog(null)
    try {
      await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selectedPlan: 'free',
          fullName: formData.name || session?.user?.name,
          email: formData.email || session?.user?.email
        })
      })
      setUserPlan('starter')
      showToast('Downgraded to free plan. Redirecting...')
      setTimeout(() => router.push('/app/dashboard'), 1500)
    } catch (err) {
      console.error('Failed to set free plan:', err)
      showToast('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDialogProceed = () => {
    if (!confirmDialog) return
    if (confirmDialog.type === 'downgrade' && confirmDialog.targetPlan === 'free') {
      doFreePlanSwitch()
    } else if (confirmDialog.type === 'downgrade') {
      // Downgrade to a lower paid plan — also goes through payment modal but they need to pay
      setConfirmDialog(null)
      setCurPlan(confirmDialog.targetPlan)
      setIsModalOpen(true)
    } else {
      // Upgrade — proceed to payment modal
      setConfirmDialog(null)
      setCurPlan(confirmDialog.targetPlan)
      setIsModalOpen(true)
    }
  }

  const openModal = (plan: string) => {
    setCurPlan(plan)
    setIsModalOpen(true)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    processPayment({
      planKey: curPlan,
      billingCycle: billing,
      user: {
        name: formData.name || session?.user?.name,
        email: formData.email || session?.user?.email,
      },
      onSuccess: async (account?: any) => {
        setIsModalOpen(false)
        setIsSubmitting(false)
        
        // Update plan in DB
        try {
          await fetch('/api/user/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              selectedPlan: curPlan,
              fullName: formData.name,
              email: formData.email
            })
          })
        } catch (err) {
          console.error('Failed to update plan:', err)
        }

        const msgs: Record<string, string> = {
          free: 'Account upgraded! Welcome aboard.',
          founding: 'Founding spot reserved! Redirecting…',
          pro: 'Pro access activated! Redirecting…'
        }
        showToast(msgs[curPlan] || 'Done!')
        
        setTimeout(() => {
          router.push('/app/dashboard')
        }, 2000)
      },
      onError: (err) => {
        setIsSubmitting(false)
        showToast(`Payment failed: ${err}`)
      }
    })
  }

  const foundingPrice = billing === 'monthly' ? 999 : 799
  const proPrice = billing === 'monthly' ? 2999 : 2399

  // Price to show in payment modal, considering proration for upgrades
  const modalDisplayPrice = (() => {
    if (!confirmDialog || !isModalOpen) {
      if (curPlan === 'founding') return foundingPrice
      if (curPlan === 'pro') return proPrice
      return 0
    }
    return confirmDialog.proratedPrice ?? confirmDialog.fullPrice
  })()

  const isProrated = !!(isWithin10Days && userPlan && userPlan !== 'starter')

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Sendrix Onboarding Automation",
    "description": "AI-powered email onboarding sequence generator for SaaS.",
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter",
        "price": "0",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "name": "Founding Member",
        "price": "999",
        "priceCurrency": "INR"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "2999",
        "priceCurrency": "INR"
      }
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I cancel my subscription any time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can cancel your subscription at any time from your account settings. You'll maintain access until the end of your billing period."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need a credit card for the free plan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, the Starter plan is free forever and does not require a credit card. You can start generating sequences immediately."
        }
      }
    ]
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC] text-[#0e0e10] antialiased selection:bg-[#E1F5EE] selection:text-[#04342C]">
      <JsonLd data={pricingSchema} />
      <JsonLd data={faqSchema} />
      {/* Styles injected to match the provided CSS exactly */}
      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
        @keyframes priceIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes savePop { 0% { transform: scale(.8); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes saveGlow { 0% { box-shadow: 0 0 0 0 rgba(239, 159, 39, .6); } 70% { box-shadow: 0 0 0 12px rgba(239, 159, 39, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 159, 39, 0); } }
        
        .anim-fade-up { animation: fadeUp .4s ease both; }
        .anim-pulse { animation: pulse 2s ease infinite; }
        .price-anim { animation: priceIn .22s ease; }
        .save-badge-anim { animation: savePop .35s cubic-bezier(.4, 0, .2, 1) forwards, saveGlow .7s ease .1s; }
      `}</style>

      <AnnouncementBar claimedSpots={47} totalSpots={100} />
      <Navbar />

      <div className="text-center py-18 px-6 bg-white border-b border-[#D3D1C7] anim-fade-up" style={{ padding: '72px 24px 56px' }}>

        <h1 className="text-5xl md:text-[clamp(36px,5vw,52px)] font-extrabold text-[#0e0e10] tracking-tight leading-[1.08] mb-3.5 luxury-gradient-text">
          Sendrix Pricing: Plans for <br /><span className="italic font-bold text-[#04342C]">Every Stage of Growth.</span>
        </h1>
        <p className="text-lg text-[#5F5E5A] max-w-[480px] mx-auto leading-[1.65] mb-8 font-light">Simple, transparent pricing. Locked in forever for Founding Members.</p>

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
          <div className={`inline-flex items-center gap-1.5 bg-[#EF9F27] text-[#03261F] font-mono text-sm font-bold px-4 py-2 rounded-[24px] border-2 border-[#BA7517] transition-all ${billing === 'yearly' ? 'save-badge-anim scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
            <Sparkles size={14} />Save 20%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1040px] mx-auto px-6 pt-14 pb-20">
        {/* FREE */}
        <div className="bg-white border border-[#D3D1C7] rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(4,52,44,0.1)] anim-fade-up" style={{ animationDelay: '0.05s' }}>
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
              <span className="text-[40px] font-extrabold text-[#0e0e10] tracking-tight">Free</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              <span className="text-[12px] text-[#888780] flex items-center gap-1"><Infinity size={11} />forever · no card</span>
            </div>
          </div>
          <div className="flex-1 mb-6 space-y-2">
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Generation <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>1 workspace</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>3 AI generations / mo</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>1 email sequence</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>Resend integration</strong></span></div>
          </div>
          <button 
            onClick={() => handlePricingClick('free')} 
            disabled={isSubmitting || userPlan === 'starter'}
            className={`w-full p-[13px] rounded-lg text-[15px] font-semibold border-[1.5px] border-[#D3D1C7] text-[#5F5E5A] bg-transparent cursor-pointer transition-all flex items-center justify-center gap-2 ${userPlan === 'starter' ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#0F6E56] hover:text-[#04342C] hover:bg-[#E1F5EE]'}`}
          >
            {userPlan === 'starter' ? <><Check size={15} /> Your current plan</> : <><ArrowRight size={15} />Get started free</>}
          </button>
          <div className="text-[12px] text-[#888780] text-center mt-2 flex items-center justify-center gap-1"><Shield size={11} />No credit card · 2 min setup</div>
        </div>

        {/* FOUNDING MEMBER */}
        <div className="bg-white border-2 border-[#04342C] rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(4,52,44,0.18)] shadow-[0_4px_24px_rgba(4,52,44,0.12)] anim-fade-up" style={{ animationDelay: '0.12s' }}>
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
              <span className="text-[20px] font-bold">₹</span>
              <span className={`text-[48px] font-extrabold tracking-tighter leading-none ${billing === 'yearly' ? 'price-anim' : 'price-anim'}`}>{foundingPrice}</span>
              <span className="text-[14px] text-[#888780] ml-0.5">/mo</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              <span className="text-[12px] text-[#888780] flex items-center gap-1"><Lock size={11} />{billing === 'monthly' ? 'Billed monthly · locked' : `Billed ₹${(foundingPrice * 12).toLocaleString()}/yr`}</span>
              {billing === 'yearly' && (
                 <>
                   <span className="text-[12px] text-[#888780] relative ml-2 line-through decoration-[#D85A30]">₹1,199/mo</span>
                   <span className="text-[11px] font-bold px-2 py-0.5 rounded-[10px] bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB] flex items-center gap-1"><TrendingDown size={10} />Save ₹2,400/yr</span>
                 </>
              )}
            </div>
          </div>
          <div className="flex-1 mb-6 space-y-2">
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Generation <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>3 workspaces</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>20 AI generations / mo</strong></span></div>
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Delivery <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>Resend integration + Analytics</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>Premium support</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#0F6E56]" /></div><span><strong>Price locked forever</strong></span></div>
          </div>
          <button 
            onClick={() => handlePricingClick('founding')} 
            disabled={isSubmitting || userPlan === 'indie'}
            className={`w-full p-[13px] rounded-lg text-[15px] font-semibold bg-[#04342C] text-white border-none cursor-pointer transition-all shadow-[0_2px_10px_rgba(4,52,44,0.22)] flex items-center justify-center gap-2 ${userPlan === 'indie' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#03261F] hover:-translate-y-[1px]'}`}
          >
            {userPlan === 'indie' ? <><Check size={15} /> Your current plan</> : <><Award size={15} />Claim founding price →</>}
          </button>

        </div>

        {/* PRO */}
        <div className="bg-white border border-[#D3D1C7] rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(4,52,44,0.1)] anim-fade-up" style={{ animationDelay: '0.19s' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#EF9F27]"></div>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-[#FAF0D8] flex items-center justify-center shrink-0">
              <Rocket size={20} className="text-[#BA7517]" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#BA7517] uppercase tracking-[0.1em]">Pro</div>
              <div className="text-[11px] text-[#BA7517]/60 font-medium">For agencies & agencies</div>
            </div>
          </div>
          <p className="text-[13px] text-[#5F5E5A] leading-[1.55] mb-0">Unlimited everything. For founders with multiple products or client work.</p>
          <div className="py-4 my-3.5 border-y border-[#f0ede6]">
            <div className="flex items-baseline gap-[3px]">
              <span className="text-[20px] font-bold">₹</span>
              <span className={`text-[48px] font-extrabold tracking-tighter leading-none ${billing === 'yearly' ? 'price-anim' : 'price-anim'}`}>{proPrice}</span>
              <span className="text-[14px] text-[#888780] ml-0.5">/mo</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              <span className="text-[12px] text-[#888780] flex items-center gap-1"><RefreshCw size={11} />{billing === 'monthly' ? 'Billed monthly' : `Billed ₹${(proPrice * 12).toLocaleString()}/yr`}</span>
              {billing === 'yearly' && (
                 <>
                   <span className="text-[12px] text-[#888780] relative ml-2 line-through decoration-[#D85A30]">₹3,599/mo</span>
                   <span className="text-[11px] font-bold px-2 py-0.5 rounded-[10px] bg-[#FAF0D8] text-[#BA7517] border border-[#f0d090] flex items-center gap-1"><TrendingDown size={10} />Save ₹7,200/yr</span>
                 </>
              )}
            </div>
          </div>
          <div className="flex-1 mb-6 space-y-2">
            <div className="text-[10px] font-bold text-[#888780] uppercase tracking-[0.1em] flex items-center gap-1.5 mb-2 mt-3.5">Unlimited everything <div className="flex-1 h-px bg-[#f0ede6]"></div></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#FAF0D8] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#BA7517]" /></div><span><strong>Unlimited workspaces</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#FAF0D8] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#BA7517]" /></div><span><strong>Unlimited AI generations</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#FAF0D8] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#BA7517]" /></div><span><strong>A/B subject line testing</strong></span></div>
            <div className="flex items-start gap-2.5 py-1 text-[13.5px] text-[#5F5E5A]"><div className="w-[18px] h-[18px] rounded-full bg-[#FAF0D8] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={2.5} className="text-[#BA7517]" /></div><span><strong>Agency-grade delivery</strong></span></div>
          </div>
          <button 
            onClick={() => handlePricingClick('pro')} 
            disabled={isSubmitting || userPlan === 'pro'}
            className={`w-full p-[13px] rounded-lg text-[15px] font-semibold bg-[#EF9F27] text-[#04342C] border-none cursor-pointer transition-all shadow-[0_2px_10px_rgba(239,159,39,0.25)] flex items-center justify-center gap-2 ${userPlan === 'pro' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f5a82e] hover:-translate-y-[1px]'}`}
          >
            {userPlan === 'pro' ? <><Check size={15} /> Your current plan</> : <><Rocket size={15} />Get Pro access →</>}
          </button>
          <div className="text-[12px] text-[#888780] text-center mt-2 flex items-center justify-center gap-1"><RefreshCw size={11} />Cancel anytime</div>
        </div>
      </div>

      <div className="max-w-[880px] mx-auto px-6 pb-20">
        <h2 className="text-[28px] font-extrabold text-[#0e0e10] tracking-tight mb-6 text-center">Compare all features</h2>
        <table className="w-full border-collapse rounded-2xl overflow-hidden border border-[#D3D1C7]">
          <thead>
            <tr className="bg-[#F5F3EC]">
              <th className="p-3.5 px-4 text-left text-[11px] font-bold text-[#888780] uppercase tracking-[0.07em] w-[40%]">Feature</th>
              <th className="p-3.5 px-4 text-center text-[11px] font-bold text-[#888780] uppercase tracking-[0.07em] w-[20%]">Starter</th>
              <th className="p-3.5 px-4 text-center text-[11px] font-bold text-white/70 uppercase tracking-[0.07em] w-[20%] bg-[#04342C]">Founding Member</th>
              <th className="p-3.5 px-4 text-center text-[11px] font-bold text-[#BA7517] uppercase tracking-[0.07em] w-[20%] bg-[#FAF0D8]">Pro</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr className="bg-[#F5F3EC]/50"><td colSpan={4} className="p-2.5 px-4 text-[10px] font-bold text-[#888780] uppercase tracking-[0.08em]">Workspaces</td></tr>
            <tr className="border-t border-[#f5f2eb] hover:bg-[#faf8f4]"><td className="p-3 px-4 text-[13.5px] font-medium text-[#0e0e10]">Workspaces</td><td className="text-center p-3 text-[13.5px]">1</td><td className="text-center p-3 text-[13.5px] bg-[#04342C]/[0.015]">3</td><td className="text-center p-3 text-[13.5px] bg-[#EF9F27]/[0.015]">Unlimited</td></tr>
            <tr className="border-t border-[#f5f2eb] hover:bg-[#faf8f4]"><td className="p-3 px-4 text-[13.5px] font-medium text-[#0e0e10]">AI generations / month</td><td className="text-center p-3 text-[13.5px]">3</td><td className="text-center p-3 text-[13.5px] bg-[#04342C]/[0.015]">20</td><td className="text-center p-3 text-[13.5px] bg-[#EF9F27]/[0.015]">Unlimited</td></tr>
            <tr className="bg-[#F5F3EC]/50"><td colSpan={4} className="p-2.5 px-4 text-[10px] font-bold text-[#888780] uppercase tracking-[0.08em]">Delivery & Support</td></tr>
            <tr className="border-t border-[#f5f2eb] hover:bg-[#faf8f4]"><td className="p-3 px-4 text-[13.5px] font-medium text-[#0e0e10]">Resend integration</td><td className="text-center p-3 text-[#1D9E75]">✓</td><td className="text-center p-3 bg-[#04342C]/[0.015] text-[#1D9E75]">✓</td><td className="text-center p-3 bg-[#EF9F27]/[0.015] text-[#1D9E75]">✓</td></tr>
            <tr className="border-t border-[#f5f2eb] hover:bg-[#faf8f4]"><td className="p-3 px-4 text-[13.5px] font-medium text-[#0e0e10]">Analytics (Open/Click)</td><td className="text-center p-3 text-[#D3D1C7]">—</td><td className="text-center p-3 bg-[#04342C]/[0.015] text-[#1D9E75]">✓</td><td className="text-center p-3 bg-[#EF9F27]/[0.015] text-[#1D9E75]">✓</td></tr>
            <tr className="border-t border-[#f5f2eb] hover:bg-[#faf8f4]"><td className="p-3 px-4 text-[13.5px] font-medium text-[#0e0e10]">Premium Support</td><td className="text-center p-3 text-[#D3D1C7]">—</td><td className="text-center p-3 bg-[#04342C]/[0.015] text-[#1D9E75]">✓</td><td className="text-center p-3 bg-[#EF9F27]/[0.015] text-[#1D9E75]">✓</td></tr>
            <tr className="border-t border-[#f5f2eb] hover:bg-[#faf8f4]"><td className="p-3 px-4 text-[13.5px] font-medium text-[#0e0e10]">A/B subject line testing</td><td className="text-center p-3 text-[#D3D1C7]">—</td><td className="text-center p-3 bg-[#04342C]/[0.015] text-[#D3D1C7]">—</td><td className="text-center p-3 bg-[#EF9F27]/[0.015] text-[#BA7517]">✓</td></tr>
            <tr className="border-t border-[#f5f2eb] hover:bg-[#faf8f4]"><td className="p-3 px-4 text-[13.5px] font-medium text-[#0e0e10]">Agency Delivery Opt.</td><td className="text-center p-3 text-[#D3D1C7]">—</td><td className="text-center p-3 bg-[#04342C]/[0.015] text-[#D3D1C7]">—</td><td className="text-center p-3 bg-[#EF9F27]/[0.015] text-[#BA7517]">✓</td></tr>
          </tbody>
        </table>
      </div>

      <div className="bg-[#04342C] py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="relative max-w-[520px] mx-auto">
          <h2 className="text-[36px] font-extrabold text-white tracking-tight mb-3 leading-[1.1]">Stop losing users on <br /><span className="italic text-[#EF9F27]">day one.</span></h2>
          <p className="text-white/55 mb-7 text-lg">Join 47 founders already automating their onboarding with SendrixAI.</p>
          <button onClick={() => handlePricingClick('founding')} className="inline-flex items-center gap-2 bg-[#EF9F27] text-[#04342C] px-8 py-3.5 rounded-lg text-sm font-bold cursor-pointer border-none transition-all hover:bg-[#f5a82e] hover:-translate-y-[2px]">
            <Award size={16} />Claim your Founding Member spot
          </button>

        </div>
      </div>

      {/* Modal */}
      <div className={`fixed inset-0 bg-[#0e0e10]/50 backdrop-blur-sm flex items-center justify-center z-[200] transition-opacity duration-200 ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
        <div className={`bg-white rounded-[18px] p-8 w-full max-w-[420px] shadow-[0_24px_64px_rgba(4,52,44,0.18)] transition-transform duration-200 ${isModalOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: curPlan === 'founding' ? '#E1F5EE' : (curPlan === 'pro' ? '#FAF0D8' : '#f0ede6') }}>
                {curPlan === 'founding' && <Award size={18} className="text-[#0F6E56]" />}
                {curPlan === 'pro' && <Rocket size={18} className="text-[#BA7517]" />}
                {curPlan === 'free' && <Leaf size={18} className="text-[#888780]" />}
             </div>
             <span className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: curPlan === 'founding' ? '#0F6E56' : (curPlan === 'pro' ? '#BA7517' : '#888780') }}>
               {curPlan === 'free' ? 'Starter' : (curPlan === 'founding' ? 'Founding Member' : 'Pro')}
             </span>
          </div>
          <h2 className="text-[24px] font-extrabold text-[#0e0e10] mb-1 tracking-tight">
             {curPlan === 'free' ? 'Create your free account' : (curPlan === 'founding' ? 'Claim your founding spot' : 'Get Pro access')}
          </h2>
          {/* Prorated price display */}
          <div className="flex items-baseline gap-2 mb-0.5">
            <div className="text-[30px] font-extrabold text-[#04342C]">
              ₹{curPlan === 'free' ? '0' : modalDisplayPrice}
              <span className="text-lg font-normal text-[#888780]">/now</span>
            </div>
            {isProrated && curPlan !== 'free' && userPlan && userPlan !== 'starter' && (
              <div className="flex items-center gap-1 bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-bold px-2 py-0.5 rounded-full">
                <TrendingDown size={10} /> Prorated credit applied
              </div>
            )}
          </div>
          {isProrated && curPlan !== 'free' && userPlan && userPlan !== 'starter' && (
            <div className="mb-1 text-[11px] text-[#5F5E5A] flex items-center gap-1">
              <span className="line-through text-[#D3D1C7]">₹{curPlan === 'founding' ? foundingPrice : proPrice}</span>
              <span>→ ₹{modalDisplayPrice} (your current plan cost deducted)</span>
            </div>
          )}
          <p className="text-[13px] text-[#888780] mb-5">
             {curPlan === 'free' ? 'No credit card required' : (curPlan === 'founding' ? 'Founding Member' : 'Pro plan · cancel anytime')}
          </p>
          {/* No-refund disclaimer for upgrades after 10 days */}
          {!isWithin10Days && curPlan !== 'free' && userPlan && userPlan !== 'starter' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-[12px] text-amber-800">
              <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
              <span>You are past the 10-day proration window. The full price will be charged. No refunds will be issued for the remaining period of your current plan.</span>
            </div>
          )}
          
          <form onSubmit={handleSubscribe} className="space-y-3.5">
            <div>
              <label className="text-[12px] font-semibold text-[#0e0e10] mb-1 block">Full name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Arjun Kumar" required className="w-full p-[11px] border-[1.5px] border-[#D3D1C7] rounded-lg text-sm bg-[#F5F3EC] outline-none transition-all focus:border-[#04342C] focus:bg-white" />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#0e0e10] mb-1 block">Work email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="arjun@yourproduct.com" required className="w-full p-[11px] border-[1.5px] border-[#D3D1C7] rounded-lg text-sm bg-[#F5F3EC] outline-none transition-all focus:border-[#04342C] focus:bg-white" />
            </div>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-[11px] border-[1.5px] border-[#D3D1C7] rounded-lg text-sm font-semibold text-[#5F5E5A] bg-transparent cursor-pointer hover:border-[#0e0e10] hover:text-[#0e0e10]">Cancel</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`flex-[2] p-[11px] rounded-lg text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-1.5 transition-all ${curPlan === 'pro' ? 'bg-[#EF9F27] text-[#04342C] hover:bg-[#f5a82e]' : 'bg-[#04342C] hover:bg-[#03261F]'}`}
              >
                {isSubmitting ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><ArrowRight size={14} />{curPlan === 'free' && status !== 'authenticated' ? 'Create free account' : 'Continue to payment'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Styled Confirm Dialog */}
      {confirmDialog?.open && (
        <div className="fixed inset-0 bg-[#0e0e10]/60 backdrop-blur-sm flex items-center justify-center z-[300]" onClick={() => setConfirmDialog(null)}>
          <div
            className="bg-white rounded-[20px] w-full max-w-[400px] mx-4 shadow-[0_24px_64px_rgba(4,52,44,0.2)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header color bar */}
            <div className={`h-[4px] w-full ${confirmDialog.type === 'downgrade' ? 'bg-red-400' : 'bg-[#0F6E56]'}`} />
            <div className="p-7">
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${confirmDialog.type === 'downgrade' ? 'bg-red-50' : 'bg-[#E1F5EE]'}`}>
                  {confirmDialog.type === 'downgrade'
                    ? <AlertTriangle size={18} className="text-red-500" />
                    : <TrendingUp size={18} className="text-[#0F6E56]" />
                  }
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#888780]">
                    {confirmDialog.type === 'downgrade' ? 'Downgrade Plan' : 'Upgrade Plan'}
                  </div>
                  <div className="text-[17px] font-extrabold text-[#0e0e10] leading-tight">
                    {confirmDialog.type === 'downgrade'
                      ? `Downgrade to ${confirmDialog.targetPlan === 'free' ? 'Free (Starter)' : 'Founding Member'}?`
                      : `Upgrade to ${ confirmDialog.targetPlan === 'pro' ? 'Pro' : 'Founding Member'}?`
                    }
                  </div>
                </div>
              </div>

              {/* Price block — only for upgrades */}
              {confirmDialog.type === 'upgrade' && (
                <div className="bg-[#F5F3EC] rounded-xl p-4 mb-4">
                  {confirmDialog.proratedPrice !== null ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-[#5F5E5A] font-medium">You pay today</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] line-through text-[#D3D1C7]">₹{confirmDialog.fullPrice}</span>
                          <span className="text-[20px] font-extrabold text-[#04342C]">₹{confirmDialog.proratedPrice}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#0F6E56] font-semibold">
                        <Check size={11} />
                        <span>₹{confirmDialog.fullPrice - confirmDialog.proratedPrice} prorated credit from your current plan (within 10-day window)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-[#5F5E5A] font-medium">You pay today</span>
                        <span className="text-[20px] font-extrabold text-[#04342C]">₹{confirmDialog.fullPrice}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-600 font-semibold">
                        <AlertTriangle size={11} />
                        <span>Past 10-day window — full price applies, no proration</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Warning box */}
              <div className={`flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-[12px] leading-relaxed ${
                confirmDialog.type === 'downgrade' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${confirmDialog.type === 'downgrade' ? 'text-red-400' : 'text-amber-500'}`} />
                <span>
                  {confirmDialog.type === 'downgrade'
                    ? 'Downgrading will not result in a refund for your current billing period. You will lose access to paid features at the end of your cycle.'
                    : 'Upgrades are non-refundable. The amount charged today will not be refunded if you later downgrade or cancel.'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-[11px] border-[1.5px] border-[#D3D1C7] rounded-xl text-sm font-semibold text-[#5F5E5A] hover:border-[#0e0e10] hover:text-[#0e0e10] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDialogProceed}
                  disabled={isSubmitting}
                  className={`flex-[1.5] py-[11px] rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${
                    confirmDialog.type === 'downgrade'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[#04342C] hover:bg-[#03261F]'
                  }`}
                >
                  {isSubmitting
                    ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : confirmDialog.type === 'downgrade'
                      ? 'Yes, downgrade'
                      : `Proceed to pay ₹${confirmDialog.proratedPrice ?? confirmDialog.fullPrice}`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed bottom-[22px] left-1/2 -translate-x-1/2 bg-[#0e0e10] text-white px-[18px] py-2.5 rounded-lg text-[13px] font-medium z-[300] transition-transform duration-[260ms] cubic-bezier-[.4,0,.2,1] flex items-center gap-2 shadow-2xl ${toast.show ? 'translate-y-0' : 'translate-y-[60px]'}`}>
        <CheckCircle size={14} className="text-[#4ade80]" />
        <span>{toast.msg}</span>
      </div>
    </div>
  )
}
