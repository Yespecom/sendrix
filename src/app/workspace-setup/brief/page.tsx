'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Briefcase, Smile, MessageSquare, Zap, Target, PartyPopper } from 'lucide-react'
import SendrixLoader from '@/components/SendrixLoader'

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Formal, authoritative', icon: Briefcase },
  { id: 'friendly', label: 'Friendly', desc: 'Warm, like a colleague', icon: Smile },
  { id: 'conversational', label: 'Conversational', desc: 'Direct, human, no fluff', icon: MessageSquare },
  { id: 'minimal', label: 'Minimal', desc: 'Short, pure value', icon: Zap },
  { id: 'bold', label: 'Bold', desc: 'Confident, action-driven', icon: Target },
  { id: 'playful', label: 'Playful', desc: 'Light, fun, consumer', icon: PartyPopper },
]

const FIELDS = [
  { key: 'productName', label: 'Product name', placeholder: 'e.g. Invoicely', max: 60, rows: 1, hint: 'The name your users will recognise.' },
  { key: 'targetUser', label: 'Who is your target user?', placeholder: 'e.g. Freelancers and independent consultants', max: 120, rows: 1, hint: 'Be specific — the more precise, the better the copy.' },
  { key: 'coreProblem', label: 'Core problem you solve', placeholder: 'e.g. Creating professional invoices takes 20+ minutes', max: 200, rows: 2, hint: 'State the pain, not your feature.' },
  { key: 'activationAction', label: 'First activation action', placeholder: 'e.g. Create and send their first invoice', max: 200, rows: 2, hint: "The single action that proves your product's value." },
  { key: 'upgradeIncentive', label: 'Main upgrade incentive', placeholder: 'e.g. Automated payment reminders and recurring invoices', max: 200, rows: 2, hint: 'What makes the paid plan a no-brainer?' },
  { key: 'productUrl', label: 'Web app domain', placeholder: 'e.g. https://app.invoicely.com', max: 100, rows: 1, hint: 'Used for links in your emails.' },
]

export default function BriefPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')

  const [formData, setFormData] = useState({
    productName: '',
    targetUser: '',
    coreProblem: '',
    activationAction: '',
    upgradeIncentive: '',
    productUrl: '',
  })
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) { router.push('/app/dashboard'); return }

    // Pre-fill product name/brief from API
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(({ product }) => {
        if (!product) return
        if (product.name) {
          setFormData(prev => ({ ...prev, productName: product.name }))
        }
        if (product.brief) {
          setFormData({
            productName: product.brief.product_name || product.name || '',
            targetUser: product.brief.target_user || '',
            coreProblem: product.brief.core_problem || '',
            activationAction: product.brief.activation_action || '',
            upgradeIncentive: product.brief.upgrade_incentive || '',
            productUrl: product.brief.product_url || '',
          })
          setSelectedTone(product.brief.tone || null)
        }
      })
  }, [productId, router])

  const filledCount = Object.values(formData).filter(v => typeof v === 'string' && v.trim().length > 0).length + (selectedTone ? 1 : 0)
  const totalFields = FIELDS.length + 1
  const progress = Math.round((filledCount / totalFields) * 100)
  const isValid = filledCount === totalFields

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !productId) return
    setIsLoading(true)
    setError('')

    const brief = {
      product_name: formData.productName,
      target_user: formData.targetUser,
      core_problem: formData.coreProblem,
      activation_action: formData.activationAction,
      upgrade_incentive: formData.upgradeIncentive,
      product_url: formData.productUrl,
      tone: selectedTone,
    }

    const res = await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief }),
    })

    setIsLoading(false)

    if (res.ok) {
      router.push(`/workspace-setup/generating?productId=${productId}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save. Please try again.')
    }
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
      <div className="mb-10">
        <div className="text-[11px] font-bold text-[#0F6E56] uppercase tracking-widest mb-3">Step 1 of 2</div>
        <h1 className="text-3xl font-bold text-[#0e0e10] mb-2 tracking-tight">Tell us about your product</h1>
        <p className="text-[#5F5E5A] text-sm leading-relaxed">Just 5 questions (under 3 minutes). Sendrix AI uses this to write your 6-email sequence.</p>
        <div className="mt-6 h-1.5 w-full bg-[#E1F5EE] rounded-full overflow-hidden">
          <div className="h-full bg-[#04342C] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] font-semibold text-[#888780] uppercase tracking-wider">{filledCount}/{totalFields} fields</span>
          <span className="text-[10px] font-semibold text-[#0F6E56]">{progress}%</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {FIELDS.map(({ key, label, placeholder, max, rows, hint }) => {
          const val = formData[key as keyof typeof formData]
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-[#0e0e10]">{label}</label>
                <span className="text-[10px] font-bold text-[#888780]">{val.length}/{max}</span>
              </div>
              {rows === 1 ? (
                <input value={val} onChange={e => setFormData({ ...formData, [key]: e.target.value })} placeholder={placeholder} className="w-full py-3 px-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] bg-white text-sm outline-none transition-all" />
              ) : (
                <textarea value={val} onChange={e => setFormData({ ...formData, [key]: e.target.value })} rows={rows} placeholder={placeholder} className="w-full py-3 px-4 rounded-xl border-2 border-[#D3D1C7] focus:border-[#04342C] bg-white text-sm outline-none transition-all resize-none leading-relaxed" />
              )}
              <p className="text-[11px] text-[#888780] mt-1">{hint}</p>
            </div>
          )
        })}

        <div>
          <label className="text-sm font-semibold text-[#0e0e10] block mb-3">Brand tone</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {TONES.map(tone => (
              <button key={tone.id} type="button" onClick={() => setSelectedTone(tone.id)} className={`p-3.5 rounded-xl text-left border-2 transition-all ${selectedTone === tone.id ? 'border-[#04342C] bg-[#E1F5EE]' : 'border-[#D3D1C7] bg-white'}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <tone.icon className="w-4 h-4" />
                  <span className="font-bold text-sm">{tone.label}</span>
                </div>
                <div className="text-[11px] text-[#5F5E5A]">{tone.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-[#FEE2E2] border border-[#D85A30] text-[#D85A30] px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}

        <button type="submit" disabled={!isValid || isLoading} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isValid && !isLoading ? 'bg-[#EF9F27] text-[#04342C]' : 'bg-[#D3D1C7] text-white opacity-60'}`}>
          {isLoading ? <SendrixLoader variant="dots" size="sm" label="Saving..." /> : 'Generate sequence →'}
        </button>
      </form>
    </div>
  )
}
