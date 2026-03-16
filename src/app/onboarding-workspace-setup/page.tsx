'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Check, Briefcase, Smile, MessageSquare, Zap, Target, PartyPopper, 
  ArrowRight, Sparkles, Layout, Mail, Terminal, Send, Info, 
  ExternalLink, Copy, CheckCircle2, AlertCircle, ChevronRight, X,
  Rocket, Bot, CircleDollarSign, TrendingUp, Flame, ShieldCheck, 
  MessageCircle, Package, Monitor, Palette, BrainCircuit, Wrench, Globe,
  Activity, Cpu, Layers, RotateCcw, Edit3, Eye, Smartphone, Download,
  Calendar, CalendarRange, Leaf, Award, Star, Lock, RefreshCw, UserPlus, Shield, TrendingDown
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRazorpay } from '@/hooks/useRazorpay'
import SendrixLoader from '@/components/SendrixLoader'
import SequenceCreationAiLoader from '@/components/SequenceCreationAiLoader'
import SequenceOrbitLoader from '@/components/SequenceOrbitLoader'
import PlanOptionCard from '@/components/PlanOptionCard'
import { Plan, resolveSignupPlanSelection, PLAN_CONFIG } from '@/lib/plans'
import { createClient } from '@/lib/supabase/client'

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Formal, authoritative', icon: Briefcase },
  { id: 'friendly', label: 'Friendly', desc: 'Warm, like a colleague', icon: Smile },
  { id: 'conversational', label: 'Conversational', desc: 'Direct, human, no fluff', icon: MessageSquare },
  { id: 'minimal', label: 'Minimal', desc: 'Short, pure value', icon: Zap },
  { id: 'bold', label: 'Bold', desc: 'Confident, action-driven', icon: Target },
  { id: 'playful', label: 'Playful', desc: 'Light, fun, consumer', icon: PartyPopper },
]

const WORK_ICONS = [
  { id: 'Rocket', icon: Rocket },
  { id: 'Zap', icon: Zap },
  { id: 'Bot', icon: Bot },
  { id: 'CircleDollarSign', icon: CircleDollarSign },
  { id: 'TrendingUp', icon: TrendingUp },
  { id: 'Sparkles', icon: Sparkles },
  { id: 'Activity', icon: Activity },
  { id: 'ShieldCheck', icon: ShieldCheck },
  { id: 'MessageCircle', icon: MessageCircle },
  { id: 'Package', icon: Package },
  { id: 'Monitor', icon: Monitor },
  { id: 'Globe', icon: Globe },
  { id: 'Cpu', icon: Cpu },
  { id: 'Layers', icon: Layers },
  { id: 'Briefcase', icon: Briefcase },
]

const GENERATING_STEPS = [
  '✓ Reading your product brief...',
  '✓ Analysing your target user...',
  '✓ Writing your welcome email...',
  '✓ Building your activation sequence...',
  '✓ Finalising 6 emails...'
]

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="flex gap-1.5 mb-8">
    {Array.from({ length: totalSteps }).map((_, s) => (
      <div 
        key={s} 
        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
          s <= currentStep ? 'bg-[#04342C]' : 'bg-[#E1F5EE]'
        }`}
      />
    ))}
  </div>
)

const OnboardingCard = ({ title, desc, children, footer, className = '' }: any) => (
  <div className={`bg-white rounded-[24px] border border-[#D3D1C7] shadow-[0_1px_4px_rgba(4,52,44,.05)] overflow-hidden ${className}`}>
    <div className="p-8 md:p-10">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#0e0e10] mb-2 tracking-tight">{title}</h1>
      <p className="text-[#5F5E5A] text-sm leading-relaxed mb-8">{desc}</p>
      {children}
    </div>
    {footer && (
      <div className="bg-[#fafaf8] border-t border-[#f0ede6] p-6 px-8 md:px-10 flex justify-between items-center">
        {footer}
      </div>
    )}
  </div>
)

const PLAN_KEYS: Plan[] = ['starter', 'indie', 'pro']
const PLAN_SELECTION_MAP: Record<Plan, string> = {
  starter: 'free',
  indie: 'founding',
  pro: 'pro',
}

export default function OnboardingWorkspaceSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { data: session } = useSession()
  const { processPayment } = useRazorpay()
  
  // Overall Flow state
  const [step, setStep] = useState(0)
  const [productId, setProductId] = useState<string | null>(null)
  
  // Form State - Workspace
  const [productName, setProductName] = useState('')
  const [emoji, setEmoji] = useState('Rocket')
  
  // Form State - Resend
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendFromEmail, setResendFromEmail] = useState('')
  const [resendFromName, setResendFromName] = useState('')
  const [resendConnected, setResendConnected] = useState(false)
  
  // Form State - AI Inputs (The Brief)
  const [targetUser, setTargetUser] = useState('')
  const [coreProblem, setCoreProblem] = useState('')
  const [activationAction, setActivationAction] = useState('')
  const [upgradeIncentive, setUpgradeIncentive] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  
  // Billing State
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  
  // Generation State
  const [generatingStepIndex, setGeneratingStepIndex] = useState(-1)
  const [genProgress, setGenProgress] = useState(0)
  const [genError, setGenError] = useState<string | null>(null)
  const genRequestSent = useRef(false)
  
  // Reveal State
  const [emails, setEmails] = useState<any[]>([])
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Plan State
  const [selectedPlanKey, setSelectedPlanKey] = useState<Plan | null>(null)
  const [planApplying, setPlanApplying] = useState(false)
  const [paidAccountInfo, setPaidAccountInfo] = useState<any>(null)

  // UI Helpers
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbUserInfo, setDbUserInfo] = useState<{name: string, email: string} | null>(null)
  const [currentDbPlan, setCurrentDbPlan] = useState<string | null>(null)

  // Set initial plan from URL if present
  useEffect(() => {
    const urlPlan = searchParams.get('selectedPlan') || searchParams.get('plan')
    if (urlPlan) {
      const resolved = resolveSignupPlanSelection(urlPlan)
      setSelectedPlanKey(resolved.plan)
    }
  }, [searchParams])

  // Resume state from cloud
  useEffect(() => {
    async function resume() {
      try {
        const [prodRes, resendRes, planRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/resend/verify'),
          fetch('/api/user/plan')
        ])

        const prodData = await prodRes.json()
        const resendData = await resendRes.json()
        const planData = await planRes.json()

        if (planData.user) {
          setDbUserInfo(planData.user)
        }
        if (planData.account) {
          setCurrentDbPlan(planData.account.plan)
        }

        if (resendData.connected) {
          setResendConnected(true)
          setResendFromEmail(resendData.config?.from_email || '')
          setResendFromName(resendData.config?.from_name || '')
        }

        if (prodRes.ok && prodData.products?.length > 0) {
          const lastProd = prodData.products[prodData.products.length - 1]
          setProductId(lastProd.id)
          setProductName(lastProd.name)
          setEmoji(lastProd.brief?.emoji || 'Rocket')
          
          if (lastProd.brief) {
            setTargetUser(lastProd.brief.target_user || '')
            setCoreProblem(lastProd.brief.core_problem || '')
            setActivationAction(lastProd.brief.activation_action || '')
            setUpgradeIncentive(lastProd.brief.upgrade_incentive || '')
            setProductUrl(lastProd.brief.product_url || '')
            setSelectedTone(lastProd.brief.tone || null)

            const seqRes = await fetch(`/api/sequences/${lastProd.id}`)
            if (seqRes.ok) {
              const seqData = await seqRes.json()
              if (seqData.sequence?.emails?.length > 0) {
                const mapped = seqData.sequence.emails.map((e: any, i: number) => ({
                  ...e,
                  id: `email-${i}`,
                }))
                setEmails(mapped)
                setSelectedEmailId(mapped[0].id)
                setStep(4)
              } else {
                setStep(3)
              }
            } else {
              setStep(3)
            }
          } else {
            setStep(resendData.connected ? 2 : 1)
          }
        } else {
          setStep(0)
        }
      } catch (err) {
        console.error('Resume error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    resume()
  }, [])

  /* ── Step Handlers ───────────────────────────── */

  const handleWorkspaceCreation = async () => {
    if (!productName.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const isNew = !productId
      const url = isNew ? '/api/products' : `/api/products/${productId}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, emoji })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save product')

      if (isNew && data.product?.id) {
        setProductId(data.product.id)
      }
      setStep(1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConnection = async () => {
    if (!resendApiKey || !resendFromEmail || !resendFromName) {
      setError('Connection details required')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/resend/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: resendApiKey, fromEmail: resendFromEmail, fromName: resendFromName })
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to connect')
      }
      setResendConnected(true)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBriefSubmission = async () => {
    if (!targetUser || !coreProblem || !activationAction || !upgradeIncentive || !productUrl || !selectedTone) {
      setError('Please fill all fields')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const brief = {
        target_user: targetUser,
        core_problem: coreProblem,
        activation_action: activationAction,
        upgrade_incentive: upgradeIncentive,
        product_url: productUrl,
        tone: selectedTone,
        emoji,
        product_name: productName
      }
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief })
      })
      if (!res.ok) throw new Error('Failed to save brief')
      setStep(3)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanSelect = async (planKey: Plan) => {
    const selection = PLAN_SELECTION_MAP[planKey]

    // If it's a paid plan, trigger Razorpay
    if (selection === 'founding' || selection === 'pro') {
      processPayment({
        planKey: selection,
        billingCycle: billing,
        user: {
          name: dbUserInfo?.name || session?.user?.name,
          email: dbUserInfo?.email || session?.user?.email,
        },
        onSuccess: async (account) => {
          setPaidAccountInfo(account)
          setStep(6)
          try {
            await fetch('/api/user/plan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ selectedPlan: selection })
            })
          } catch (err) {
            console.error('Failed to update plan after payment:', err)
          }
        },
        onError: (err) => {
          console.error('Payment failed:', err)
          setError(err)
        }
      })
      return
    }

    // For starter plan, proceed directly
    setPlanApplying(true)
    setSelectedPlanKey(planKey)
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedPlan: selection })
      })
      if (res.ok) {
        router.push('/app/dashboard')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setPlanApplying(false)
    }
  }

  // Effect for Generation
  useEffect(() => {
    if (step === 3 && productId && !genRequestSent.current) {
      genRequestSent.current = true
      
      const run = async () => {
        const interval = setInterval(() => {
          setGenProgress(p => Math.min(p + 1.5, 98))
        }, 100)

        const stepsInterval = setInterval(() => {
          setGeneratingStepIndex(i => i < 4 ? i + 1 : i)
        }, 1200)

        try {
          const res = await fetch('/api/products/generate-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
          })
          clearInterval(interval)
          clearInterval(stepsInterval)
          if (!res.ok) throw new Error('Generation failed')
          
          setGenProgress(100)
          const seqRes = await fetch(`/api/sequences/${productId}`)
          const data = await seqRes.json()
          if (data.sequence?.emails) {
            setEmails(data.sequence.emails.map((e: any, i: number) => ({ ...e, id: `email-${i}` })))
            setSelectedEmailId(`email-0`)
          }
          setTimeout(() => setStep(4), 1000)
        } catch (err: any) {
          setGenError(err.message)
        }
      }
      run()
    }
  }, [step, productId])

  if (isLoading) return <div className="min-h-screen bg-[#F5F3EC] flex items-center justify-center"><SendrixLoader variant="full" label="Preparing..." /></div>

  /* ── Step Views ────────────────────────────── */

  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#F5F3EC] py-16 px-6">
        <div className="max-w-xl mx-auto">
          <ProgressBar currentStep={0} totalSteps={6} />
          <OnboardingCard title="Create your Workspace" desc="Setup your SaaS profile to begin.">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {WORK_ICONS.map(i => (
                  <button key={i.id} onClick={() => setEmoji(i.id)} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 ${emoji === i.id ? 'border-[#04342C] bg-[#E1F5EE]' : 'border-[#D3D1C7]'}`}>
                    <i.icon size={18} />
                  </button>
                ))}
              </div>
              <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="Product Name" className="w-full p-4 rounded-xl border-2 border-[#D3D1C7]" />
              {error && <div className="text-red-500 text-sm font-bold">{error}</div>}
              <button onClick={handleWorkspaceCreation} className="w-full py-4 bg-[#04342C] text-white rounded-xl font-bold flex items-center justify-center gap-2">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </OnboardingCard>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#F5F3EC] py-16 px-6">
        <div className="max-w-xl mx-auto">
          <ProgressBar currentStep={1} totalSteps={6} />
          <OnboardingCard title="Connect Email" desc="Connect Resend to automate delivery.">
            <div className="space-y-4">
              <input type="password" value={resendApiKey} onChange={e => setResendApiKey(e.target.value)} placeholder="Resend API Key (re_...)" className="w-full p-4 border-2 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input value={resendFromName} onChange={e => setResendFromName(e.target.value)} placeholder="Sender Name" className="p-4 border-2 rounded-xl" />
                <input value={resendFromEmail} onChange={e => setResendFromEmail(e.target.value)} placeholder="Sender Email" className="p-4 border-2 rounded-xl" />
              </div>
              {error && <div className="text-red-500 font-bold text-sm">{error}</div>}
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 text-[#5F5E5A] font-bold">Skip</button>
                <button onClick={handleResendConnection} className="flex-[2] bg-[#04342C] text-white py-4 rounded-xl font-bold">Connect & Continue</button>
              </div>
            </div>
          </OnboardingCard>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#F5F3EC] py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <ProgressBar currentStep={2} totalSteps={6} />
          <OnboardingCard title="Build your Strategy" desc="Tell us about your product so Sendrix AI can write your sequence.">
            <div className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <label className="text-sm font-bold text-[#0e0e10] mb-2 block">Target User</label>
                  <input value={targetUser} onChange={e => setTargetUser(e.target.value)} placeholder="e.g. Early-stage startup founders" className="w-full p-4 border-2 rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[#0e0e10] mb-2 block">Core Problem</label>
                  <textarea value={coreProblem} onChange={e => setCoreProblem(e.target.value)} placeholder="e.g. Tracking SaaS metrics is manual and slow" className="w-full p-4 border-2 rounded-xl h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-[#0e0e10] mb-2 block">Aha! Moment</label>
                    <input value={activationAction} onChange={e => setActivationAction(e.target.value)} placeholder="e.g. Connect first data source" className="w-full p-4 border-2 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#0e0e10] mb-2 block">Upgrade Incentive</label>
                    <input value={upgradeIncentive} onChange={e => setUpgradeIncentive(e.target.value)} placeholder="e.g. Unlock real-time exports" className="w-full p-4 border-2 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-sm font-bold text-[#0e0e10] mb-2 block">App URL</label>
                    <input value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="https://app.yoursite.com" className="w-full p-4 border-2 rounded-xl" />
                  </div>
                   <div>
                    <label className="text-sm font-bold text-[#0e0e10] mb-2 block">Brand Tone</label>
                    <select value={selectedTone || ''} onChange={e => setSelectedTone(e.target.value)} className="w-full p-4 border-2 rounded-xl bg-white">
                      <option value="">Select Tone...</option>
                      {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {error && <div className="text-red-500 font-bold text-sm">{error}</div>}
              <button onClick={handleBriefSubmission} className="w-full py-4 bg-[#EF9F27] text-[#04342C] rounded-xl font-bold flex items-center justify-center gap-2">
                Generate AI Sequence <Sparkles size={18} />
              </button>
            </div>
          </OnboardingCard>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#04342C] flex flex-col items-center justify-center p-6 text-[#E1F5EE]">
        <SequenceCreationAiLoader label="Generating your sequence" />
        <div className="w-full max-w-sm space-y-4 mt-12">
          {GENERATING_STEPS.map((s, i) => (
             <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${i <= generatingStepIndex ? 'opacity-100' : 'opacity-20'}`}>
               <span className={i < generatingStepIndex ? 'text-[#EF9F27]' : 'text-white'}>✓</span>
               {s.replace('✓ ', '')}
             </div>
          ))}
        </div>
        {genError && <div className="mt-8 text-red-400 font-bold">{genError} <button onClick={() => window.location.reload()} className="underline ml-2">Retry</button></div>}
        <div className="fixed bottom-0 left-0 w-full h-2 bg-black/20">
          <div className="h-full bg-[#EF9F27]" style={{ width: `${genProgress}%`, transition: 'width 0.2s linear' }} />
        </div>
      </div>
    )
  }

  if (step === 4) {
    const activeEmail = emails.find(e => e.id === selectedEmailId) || emails[0]
    return (
      <div className="min-h-screen bg-[#F5F3EC]">
        <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-[#04342C] rounded-xl flex items-center justify-center text-white font-bold">{productName[0]}</div>
             <div>
               <h2 className="font-bold text-[#0e0e10]">{productName} Onboarding</h2>
               <div className="text-[10px] font-bold text-[#888780] uppercase tracking-widest">Review & Edit</div>
             </div>
          </div>
          <button onClick={() => setStep(5)} className="bg-[#04342C] text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2">
            Next: Select Plan <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-2">
            {emails.map((e, i) => (
              <button key={e.id} onClick={() => setSelectedEmailId(e.id)} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedEmailId === e.id ? 'border-[#04342C] bg-white shadow-lg' : 'border-[#D3D1C7] bg-white/50'}`}>
                <div className="text-[10px] font-bold text-[#888780] mb-1">EMAIL {i+1}</div>
                <div className="text-sm font-bold truncate">{e.subject}</div>
              </button>
            ))}
          </div>
          
          <div className="bg-white rounded-3xl border-2 border-[#D3D1C7] p-10 shadow-sm">
            <div className="mb-8 pb-8 border-b">
              <label className="text-[10px] font-bold text-[#888780] uppercase tracking-widest mb-2 block">Subject</label>
              <input value={activeEmail?.subject || ''} onChange={ev => {
                const updated = emails.map(em => em.id === activeEmail.id ? { ...em, subject: ev.target.value } : em)
                setEmails(updated)
              }} className="w-full text-2xl font-black outline-none" />
            </div>
            <textarea value={activeEmail?.body || ''} onChange={ev => {
                const updated = emails.map(em => em.id === activeEmail.id ? { ...em, body: ev.target.value } : em)
                setEmails(updated)
            }} className="w-full min-h-[400px] outline-none leading-relaxed text-[#5F5E5A] font-medium" />
          </div>
        </div>
      </div>
    )
  }

  if (step === 5) {
    const foundingPrice = billing === 'monthly' ? 999 : 799
    const proPrice = billing === 'monthly' ? 2999 : 2399

    return (
      <div className="min-h-screen bg-[#F5F3EC] font-sans text-[#0e0e10] antialiased">
        <style jsx global>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
          @keyframes priceIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes savePop { 0% { transform: scale(.8); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
          @keyframes saveGlow { 0% { box-shadow: 0 0 0 0 rgba(239, 159, 39, .6); } 70% { box-shadow: 0 0 0 12px rgba(239, 159, 39, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 159, 39, 0); } }
        `}</style>

        <div className="text-center pt-20 pb-14 px-6 bg-white border-b border-[#D3D1C7] animate-[fadeUp_0.4s_ease_both]">
          <div className="max-w-xl mx-auto mb-10">
            <ProgressBar currentStep={5} totalSteps={6} />
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
          <div className={`bg-white border-2 rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(4,52,44,0.1)] animate-[fadeUp_0.45s_ease_both] ${selectedPlanKey === 'starter' ? 'border-[#0F6E56] shadow-[0_4px_24px_rgba(15,110,86,0.12)]' : 'border-[#D3D1C7]'}`}>
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
              onClick={() => handlePlanSelect('starter')}
              disabled={planApplying || currentDbPlan === 'starter'}
              className="w-full p-[13px] rounded-lg text-[15px] font-semibold border-[1.5px] border-[#D3D1C7] text-[#5F5E5A] bg-transparent cursor-pointer transition-all hover:border-[#0F6E56] hover:text-[#04342C] hover:bg-[#E1F5EE] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {currentDbPlan === 'starter' ? <><Check size={15} /> Your current plan</> : <><UserPlus size={15} />Get started free</>}
            </button>
          </div>

          <div className={`bg-white border-2 rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(4,52,44,0.18)] animate-[fadeUp_0.52s_ease_both] ${selectedPlanKey === 'indie' ? 'border-[#04342C] shadow-[0_4px_24px_rgba(4,52,44,0.12)]' : 'border-transparent border-t-[#04342C]'}`}>
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
                {billing === 'yearly' && foundingPrice > 1 && (
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
              onClick={() => handlePlanSelect('indie')}
              disabled={planApplying || currentDbPlan === 'indie'}
              className="w-full p-[13px] rounded-lg text-[15px] font-semibold bg-[#04342C] text-white border-none cursor-pointer transition-all hover:bg-[#03261F] hover:-translate-y-[1px] shadow-[0_2px_10px_rgba(4,52,44,0.22)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {currentDbPlan === 'indie' ? <><Check size={15} /> Your current plan</> : <><Award size={15} />Claim founding price →</>}
            </button>
          </div>

          <div className={`bg-white border-2 rounded-[18px] p-7 flex flex-col relative overflow-hidden transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(4,52,44,0.1)] animate-[fadeUp_0.59s_ease_both] ${selectedPlanKey === 'pro' ? 'border-[#EF9F27] shadow-[0_4px_24px_rgba(239,159,39,0.12)]' : 'border-[#D3D1C7]'}`}>
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
              onClick={() => handlePlanSelect('pro')}
              disabled={planApplying || currentDbPlan === 'pro'}
              className="w-full p-[13px] rounded-lg text-[15px] font-semibold bg-[#EF9F27] text-[#04342C] border-none cursor-pointer transition-all hover:bg-[#f5a82e] hover:-translate-y-[1px] shadow-[0_2px_10px_rgba(239,159,39,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {currentDbPlan === 'pro' ? <><Check size={15} /> Your current plan</> : <><Rocket size={15} />Get Pro access →</>}
            </button>
          </div>
        </div>
        {planApplying && <div className="fixed bottom-12 left-1/2 -translate-x-1/2 text-[#04342C] font-bold animate-pulse text-lg">Launching your dashboard...</div>}
      </div>
    )
  }

  if (step === 6) {
    return (
      <div className="min-h-screen bg-[#F5F3EC] flex items-center justify-center p-6 antialiased">
        <OnboardingCard 
          title="Payment Successful!" 
          desc="Your account has been upgraded and your founding price is now active. You're ready to grow your product."
          className="max-w-xl animate-[fadeUp_0.4s_ease_both]"
        >
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#E1F5EE] border-2 border-[#9FE1CB] relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                 <PartyPopper size={60} className="text-[#0F6E56]" />
               </div>
               <div className="flex items-center gap-2 mb-3">
                 <div className="px-2 py-0.5 rounded-full bg-[#04342C] text-white text-[10px] font-black uppercase tracking-wider">Active</div>
                 <div className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-[0.1em]">Your Subscription</div>
               </div>
               <div className="text-2xl font-black text-[#0e0e10]">
                 {paidAccountInfo?.plan === 'indie' || paidAccountInfo?.plan === 'founding' ? 'Founding Member' : 'Pro Plan'}
               </div>
               {paidAccountInfo?.nextBillingDate && (
                 <div className="flex items-center gap-2 text-sm text-[#0F6E56] mt-3 font-medium">
                   <Calendar size={14} />
                   Next payment: {new Date(paidAccountInfo.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                 </div>
               )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {paidAccountInfo?.lastPaymentId && (
                <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-[#D3D1C7] bg-white group hover:border-[#04342C] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F3EC] flex items-center justify-center text-[#5F5E5A] group-hover:bg-[#E1F5EE] group-hover:text-[#04342C] transition-colors">
                      <Download size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#888780] uppercase tracking-wider">Billing History</div>
                      <div className="text-sm font-bold">Latest Invoice</div>
                    </div>
                  </div>
                  <a 
                    href={`https://dashboard.razorpay.com/app/payments/${paidAccountInfo.lastPaymentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#04342C] text-white text-xs font-bold hover:bg-[#03261F] transition-all"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button 
                onClick={() => router.push('/app/dashboard')} 
                className="w-full bg-[#04342C] text-white py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(4,52,44,0.15)] hover:shadow-[0_25px_50px_rgba(4,52,44,0.2)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={20} />
              </button>
              <p className="text-center text-[11px] text-[#888780] mt-4 font-medium italic">
                You can always access your billing details in Settings.
              </p>
            </div>
          </div>
        </OnboardingCard>
      </div>
    )
  }

  return null
}
