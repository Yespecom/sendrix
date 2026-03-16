'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Check, Briefcase, Smile, MessageSquare, Zap, Target, PartyPopper, 
  ArrowRight, Sparkles, Layout, Mail, Terminal, Send, Info, 
  ExternalLink, Copy, CheckCircle2, AlertCircle, ChevronRight, X,
  Rocket, Bot, CircleDollarSign, TrendingUp, Flame, ShieldCheck, 
  MessageCircle, Package, Monitor, Palette, BrainCircuit, Wrench, Globe,
  Activity, Cpu, Layers
} from 'lucide-react'
import SendrixLoader from '@/components/SendrixLoader'
import { resolveSignupPlanSelection } from '@/lib/plans'

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

const IconRenderer = ({ iconName, className }: { iconName: string, className?: string }) => {
  const Icon = WORK_ICONS.find(i => i.id === iconName)?.icon || Rocket
  return <Icon className={className} />
}

const ProgressBar = ({ step }: { step: number }) => (
  <div className="flex gap-1.5 mb-8">
    {[0, 1, 2, 3, 4].map((s) => (
      <div 
        key={s} 
        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
          s <= step ? 'bg-[#04342C]' : 'bg-[#E1F5EE]'
        }`}
      />
    ))}
  </div>
)

const OnboardingCard = ({ title, desc, children, footer }: any) => (
  <div className="bg-white rounded-[24px] border border-[#D3D1C7] shadow-[0_1px_4px_rgba(4,52,44,.05)] overflow-hidden">
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

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [productId, setProductId] = useState<string | null>(null)
  
  // Form State
  const [productName, setProductName] = useState('')
  const [targetUser, setTargetUser] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [emoji, setEmoji] = useState('Rocket')
  
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendFromEmail, setResendFromEmail] = useState('')
  const [resendFromName, setResendFromName] = useState('')
  const [resendConnected, setResendConnected] = useState(false)
  
  const [coreProblem, setCoreProblem] = useState('')
  const [activationAction, setActivationAction] = useState('')
  const [upgradeIncentive, setUpgradeIncentive] = useState('')
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  
  // UI State
  const [isLoading, setIsLoading] = useState(false)
  const [testSent, setTestSent] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')
  const selectedPlanFromUrl = searchParams.get('selectedPlan') || searchParams.get('plan')
  const selectedPlan = resolveSignupPlanSelection(
    selectedPlanFromUrl
  )

  useEffect(() => {
    const pid = localStorage.getItem('sendrix_current_product_id')
    if (pid) setProductId(pid)
  }, [])

  useEffect(() => {
    if (!selectedPlanFromUrl) return

    fetch('/api/user/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedPlan: selectedPlan.selection }),
    }).catch((err) => {
      console.error('Failed to sync selected plan on onboarding:', err)
    })
  }, [selectedPlanFromUrl, selectedPlan.selection])

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  /* ── Step Handlers ───────────────────────────── */

  const next = () => {
    setStep(s => s + 1)
    window.scrollTo(0, 0)
  }
  const back = () => {
    setStep(s => s - 1)
    window.scrollTo(0, 0)
  }

  const handleStep1 = async () => {
    setIsLoading(true)
    setError('')
    try {
      const method = productId ? 'PATCH' : 'POST'
      const url = productId ? `/api/products/${productId}` : '/api/products'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, brief: { emoji, product_name: productName, target_user: targetUser, product_url: productUrl } })
      })
      
      const data = await res.json()
      
      if (res.status === 403) {
        // Ownership mismatch (e.g. leftover localStorage from another user)
        // Reset and try again via POST
        setProductId(null)
        localStorage.removeItem('sendrix_current_product_id')
        
        const freshRes = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: productName, emoji })
        })
        const freshData = await freshRes.json()
        if (freshRes.ok) {
          setProductId(freshData.product.id)
          localStorage.setItem('sendrix_current_product_id', freshData.product.id)
          next()
          setIsLoading(false)
          return
        }
      }

      if (res.ok) {
        if (!productId && data.product?.id) {
          setProductId(data.product.id)
          localStorage.setItem('sendrix_current_product_id', data.product.id)
        }
        next()
      } else {
        setError(data.error || 'Failed to save product')
      }
    } catch (err: any) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  const handleStep2 = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/resend/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: resendApiKey, fromEmail: resendFromEmail, fromName: resendFromName })
      })
      const data = await res.json()
      if (res.ok) {
        setResendConnected(true)
        next()
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch (err: any) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  const sendTestEmail = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/resend/test-email', { method: 'POST' })
      if (res.ok) setTestSent(true)
    } catch (e) {}
    setIsLoading(false)
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setError('')
    try {
      const brief = {
        product_name: productName,
        target_user: targetUser,
        core_problem: coreProblem,
        activation_action: activationAction,
        upgrade_incentive: upgradeIncentive,
        product_url: productUrl,
        tone: selectedTone,
        emoji
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      })

      if (res.ok) {
        router.push('/workspace-setup/generating')
      } else {
        setError('Failed to save brief')
      }
    } catch (err: any) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  /* ── View Steps ─────────────────────────────── */

  if (step === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6">
        <OnboardingCard 
          title="Welcome to Sendrix" 
          desc="Let's get your automated onboarding flow running. Here is your setup roadmap:"
          footer={
            <button 
              onClick={next}
              className="w-full py-4 bg-[#0e0e10] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a1a1c] transition-all"
            >
              Get Started <ArrowRight size={18} />
            </button>
          }
        >
          <div className="space-y-4">
            {[
              { icon: Layout, label: 'Create your workspace' },
              { icon: Mail, label: 'Connect Resend (Email Delivery)' },
              { icon: Terminal, label: 'Integrate Webhook' },
              { icon: Sparkles, label: 'AI Sequence Generation' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[#f0ede6] bg-[#fafaf8]">
                <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] border border-[#0F6E56]/15 flex items-center justify-center text-[#0F6E56]">
                  <item.icon size={20} />
                </div>
                <span className="font-semibold text-[#0e0e10]">{item.label}</span>
              </div>
            ))}
          </div>
        </OnboardingCard>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6">
        <ProgressBar step={step} />
        <OnboardingCard 
          title="Product Identity" 
          desc="Give your workspace a name and select an icon that represents your mission."
          footer={
            <>
              <div />
              <button 
                onClick={handleStep1}
                disabled={!productName || !targetUser || !productUrl || isLoading}
                className="py-3 px-8 bg-[#04342C] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <SendrixLoader variant="dots" size="sm" label="Saving" />
                    Saving...
                  </>
                ) : (
                  'Next Step'
                )}{' '}
                <ArrowRight size={18} />
              </button>
            </>
          }
        >
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {WORK_ICONS.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setEmoji(item.id)}
                    className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all ${
                      emoji === item.id ? 'border-[#04342C] bg-[#E1F5EE] text-[#04342C]' : 'border-[#f0ede6] bg-[#fafaf8] text-[#888780] hover:border-[#D3D1C7]'
                    }`}
                  >
                    <item.icon size={20} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2 block">Workspace Name</label>
              <input 
                type="text" 
                value={productName} 
                onChange={e => setProductName(e.target.value)} 
                placeholder="e.g. Acme SaaS"
                className="w-full p-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2 block">Who do you serve?</label>
              <input 
                type="text" 
                value={targetUser} 
                onChange={e => setTargetUser(e.target.value)} 
                placeholder="e.g. Direct-to-consumer brands"
                className="w-full p-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-2 block">Web App Domain</label>
              <input 
                type="text" 
                value={productUrl} 
                onChange={e => setProductUrl(e.target.value)} 
                placeholder="e.g. https://app.acme.com"
                className="w-full p-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all font-medium"
              />
            </div>
          </div>
        </OnboardingCard>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6">
        <ProgressBar step={step} />
        <OnboardingCard 
          title="Connect Resend" 
          desc="Sendrix sends emails through your own domain via Resend. This gives you 100% control over deliverability."
          footer={
            <>
              <button onClick={next} className="text-sm font-bold text-[#888780] hover:text-[#0e0e10]">Skip for now</button>
              <button 
                onClick={handleStep2}
                disabled={!resendApiKey || !resendFromEmail || isLoading}
                className="py-3 px-8 bg-[#04342C] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <SendrixLoader variant="dots" size="sm" label="Verifying" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}{' '}
                <ArrowRight size={18} />
              </button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-4 rounded-xl flex gap-3 text-[#B45309]">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed">
                <span className="font-bold">Pro Tip:</span> If you haven't verified your domain in Resend yet, it can take up to 24 hours to propagate.
              </div>
            </div>

            <div className="space-y-4 py-2 border-y border-[#f0ede6]">
              {[
                { label: 'Create an API Key (re_...)', done: !!resendApiKey },
                { label: 'Verify your domain in Resend', done: true },
                { label: 'Enter API details below', done: !!resendApiKey && !!resendFromEmail },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-[#0F6E56] text-white' : 'border-2 border-[#D3D1C7]'}`}>
                    {item.done && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-xs font-semibold text-[#5F5E5A]">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-[#888780] tracking-wider mb-2 block">RESEND API KEY</label>
                <input 
                  type="password" 
                  value={resendApiKey} 
                  onChange={e => setResendApiKey(e.target.value)} 
                  placeholder="re_••••••••"
                  className="w-full p-3.5 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#888780] tracking-wider mb-2 block">SENDER NAME</label>
                  <input 
                    type="text" 
                    value={resendFromName} 
                    onChange={e => setResendFromName(e.target.value)} 
                    placeholder="Alex from Sendrix"
                    className="w-full p-3.5 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#888780] tracking-wider mb-2 block">SUPPORT EMAIL</label>
                  <input 
                    type="email" 
                    value={resendFromEmail} 
                    onChange={e => setResendFromEmail(e.target.value)} 
                    placeholder="hello@yourdomain.com"
                    className="w-full p-3.5 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>
            {error && <div className="text-xs font-bold text-[#D85A30] text-center">{error}</div>}
          </div>
        </OnboardingCard>
      </div>
    )
  }

  if (step === 3) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const webhookUrl = `${origin}/api/webhook/${productId || '...'}`
    const snippet = `const payload = JSON.stringify({ email: 'user@example.com', name: 'Jane' })
const sig = crypto.createHmac('sha256', process.env.SENDRIX_SECRET).update(payload).digest('hex')

fetch('${webhookUrl}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Sendrix-Signature': sig },
  body: payload
})`

    return (
      <div className="max-w-xl mx-auto py-16 px-6">
        <ProgressBar step={step} />
        <OnboardingCard 
          title="Webhook Integration" 
          desc="Connect your existing signup flow to Sendrix. New users will be automatically enrolled in your sequence."
          footer={
            <>
              <button onClick={back} className="text-sm font-extrabold text-[#888780] hover:text-[#0e0e10]">Back</button>
              <button 
                onClick={next}
                className="py-3 px-8 bg-[#04342C] text-white rounded-xl font-bold flex items-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#888780] uppercase tracking-widest">Your Private Webhook URL</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-[#fafaf8] border border-[#D3D1C7] rounded-xl text-xs font-mono text-[#04342C] truncate">
                  {webhookUrl}
                </div>
                <button 
                  onClick={() => copy(webhookUrl, 'url')}
                  className="p-3 bg-white border border-[#D3D1C7] rounded-xl hover:bg-[#fafaf8]"
                >
                  {copied === 'url' ? <CheckCircle2 size={16} className="text-[#0F6E56]" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-end">
                 <label className="text-[10px] font-bold text-[#888780] uppercase tracking-widest">Node.js Integration Code</label>
                 <button onClick={() => copy(snippet, 'code')} className="text-[10px] font-bold text-[#0F6E56] hover:underline">
                   {copied === 'code' ? 'Copied Snippet!' : 'Copy Code'}
                 </button>
               </div>
               <div className="bg-[#0e0e10] p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner">
                 <pre className="text-white">{snippet}</pre>
               </div>
            </div>

            <div className="pt-4 border-t border-[#f0ede6] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#0e0e10]">Verify Connection</div>
                <div className="text-[11px] text-[#888780]">Send a test payload to your domain.</div>
              </div>
              <button 
                disabled={!resendConnected || isLoading}
                onClick={sendTestEmail}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D3D1C7] rounded-lg text-xs font-bold hover:bg-[#fafaf8] disabled:opacity-40 transition-colors"
              >
                {testSent ? <><Check size={14} className="text-[#0F6E56]" /> Success!</> : <><Send size={14} /> Send Test Email</>}
              </button>
            </div>
          </div>
        </OnboardingCard>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6">
        <ProgressBar step={step} />
        <OnboardingCard 
          title="AI Generation" 
          desc="Tell Sendrix AI about your product's value proposition. We'll generate a high-converting 6-email sequence."
          footer={
            <>
              <button onClick={back} className="text-sm font-extrabold text-[#888780] hover:text-[#0e0e10]">Back</button>
              <button 
                onClick={handleGenerate}
                disabled={!coreProblem || !activationAction || !upgradeIncentive || !selectedTone || isLoading}
                className="py-4 px-10 bg-[#EF9F27] text-[#04342C] rounded-xl font-extrabold text-lg flex items-center gap-2 hover:bg-[#d4891f] shadow-[0_4px_20px_rgba(239,159,39,.3)] active:scale-[0.98] transition-all"
              >
                {isLoading ? (
                  <>
                    <SendrixLoader variant="dots" size="sm" label="Writing sequence" />
                    Writing Sequence...
                  </>
                ) : (
                  'Generate Emails →'
                )}
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
               <div>
                  <label className="text-xs font-bold text-[#888780] tracking-wider mb-2 block uppercase text-[10px]">What is the main pain point?</label>
                  <textarea 
                    value={coreProblem} 
                    onChange={e => setCoreProblem(e.target.value)} 
                    placeholder="e.g. Managing inventory manually takes hours"
                    rows={2}
                    className="w-full p-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all text-sm leading-relaxed"
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-[#888780] tracking-wider mb-2 block uppercase text-[10px]">What should they do first?</label>
                  <textarea 
                    value={activationAction} 
                    onChange={e => setActivationAction(e.target.value)} 
                    placeholder="e.g. Upload your first CSV file"
                    rows={2}
                    className="w-full p-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all text-sm leading-relaxed"
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-[#888780] tracking-wider mb-2 block uppercase text-[10px]">Why should they pay?</label>
                  <textarea 
                    value={upgradeIncentive} 
                    onChange={e => setUpgradeIncentive(e.target.value)} 
                    placeholder="e.g. Automated forecasting and multi-user access"
                    rows={2}
                    className="w-full p-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] outline-none transition-all text-sm leading-relaxed"
                  />
               </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[#888780] tracking-wider mb-3 block uppercase text-[10px]">Choose your voice</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setSelectedTone(t.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedTone === t.id ? 'border-[#04342C] bg-[#E1F5EE]' : 'border-[#f0ede6] bg-white'
                      }`}
                    >
                      <div className="font-bold text-[11px] mb-0.5">{t.label}</div>
                      <div className="text-[10px] text-[#888780]">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#fafaf8] border border-[#f0ede6] rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] font-bold text-[#0F6E56] uppercase tracking-[0.2em] mb-4">Final Review</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#888780]">Project</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <IconRenderer iconName={emoji} className="w-3.5 h-3.5" />
                      {productName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#888780]">Domain</span>
                    <span className="font-bold truncate max-w-[120px]">{productUrl}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#888780]">Resend</span>
                    <span className={`font-bold ${resendConnected ? 'text-[#0F6E56]' : 'text-[#888780]'}`}>
                      {resendConnected ? 'Connected' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#888780]">Webhook</span>
                    <span className="font-bold text-[#0F6E56]">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </OnboardingCard>
      </div>
    )
  }

  return null
}
