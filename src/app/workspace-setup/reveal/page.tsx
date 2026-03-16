'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronRight, 
  Mail, 
  ArrowRight, 
  Edit3, 
  Eye, 
  Zap,
  Globe,
  Settings,
  MousePointer2,
  Copy,
  Download,
  RotateCcw,
  FileText,
  Smartphone,
  Monitor,
  CheckCircle2,
  Info,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getSession } from 'next-auth/react'
import SequenceOrbitLoader from '@/components/SequenceOrbitLoader'
import { PLAN_CONFIG } from '@/lib/plans'

type Email = {
  id: string
  email_number: number
  email_type: string
  subject: string
  preview_text: string
  body: string
  send_delay_days: number
  cta_text: string
  cta_url_placeholder: string
  design_template?: string
}

const formatEmailLimitText = (value?: number | null) =>
  typeof value === 'number' ? `${value.toLocaleString()} emails / mo` : 'Unlimited emails'

export default function RevealPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [product, setProduct] = useState<any>(null)
  const [isFoundingMember, setIsFoundingMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [copySuccess, setCopySuccess] = useState(false)
  const [resendConnected, setResendConnected] = useState(false)
  const [userEmail, setUserEmail] = useState('user@customer.io')
  const [activating, setActivating] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [account, setAccount] = useState<any>(null)
  const [showPlanSummary, setShowPlanSummary] = useState(false)
  const [showResendModal, setShowResendModal] = useState(false)
  const [showPlanOptions, setShowPlanOptions] = useState(false)
  const [resendForm, setResendForm] = useState({
    apiKey: '',
    fromName: '',
    fromEmail: '',
  })
  const [modalError, setModalError] = useState('')
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const pid = searchParams.get('productId')
      if (!pid) {
        router.push('/app/dashboard')
        return
      }
      
      try {
        const [res, session] = await Promise.all([
          fetch(`/api/sequences/${pid}`),
          getSession()
        ])

        if (session?.user?.email) setUserEmail(session.user.email)
        if (!res.ok) throw new Error('Failed to fetch sequence')
        
        const data = await res.json()
        
        if (data.product) setProduct(data.product)
        if (data.resendConnected) setResendConnected(true)
        if (data.product?.user?.founding_member) setIsFoundingMember(true)

        if (data.sequence && data.sequence.emails) {
          const mapped = data.sequence.emails.map((e: any, i: number) => ({
            ...e,
            id: `email-${i}`,
            email_number: e.email_number || i + 1
          }))
          setEmails(mapped)
          setSelectedId(mapped[0]?.id || null)
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router, searchParams])

  useEffect(() => {
    let cancelled = false
    const loadPlan = async () => {
      try {
        const res = await fetch('/api/user/plan')
        if (!res.ok) throw new Error('Failed to fetch plan')
        const payload = await res.json()
        if (!cancelled && payload.account) {
          setAccount(payload.account)
        }
      } catch (error) {
        console.error('Could not load plan info:', error)
      }
    }
    loadPlan()
    return () => {
      cancelled = true
    }
  }, [])


  const handleUpdate = async (id: string, field: string, value: any) => {
    const updatedEmails = emails.map(e => e.id === id ? { ...e, [field]: value } : e)
    setEmails(updatedEmails)
    
    const pid = searchParams.get('productId')
    if (pid) {
      const emailsToSave = updatedEmails.map((emailObj) => {
        const copy = { ...emailObj }
        delete (copy as { id?: string }).id
        return copy
      })
      await supabase.from('sequences').update({ emails: emailsToSave }).eq('product_id', pid)
    }
  }

  const handleActivate = async () => {
    const pid = searchParams.get('productId')
    if (!pid) return
    
    setActivating(true)
    try {
      const res = await fetch(`/api/sequences/${pid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
      if (res.ok) {
        setShowIntegrationModal(true)
      }
    } catch (err) {
      console.error('Activation error:', err)
    } finally {
      setActivating(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Day', 'Type', 'Subject', 'Preview Text', 'Body', 'CTA Text', 'CTA URL']
    const rows = emails.map(e => [
      e.send_delay_days,
      e.email_type,
      `"${e.subject.replace(/"/g, '""')}"`,
      `"${e.preview_text.replace(/"/g, '""')}"`,
      `"${e.body.replace(/"/g, '""')}"`,
      `"${e.cta_text.replace(/"/g, '""')}"`,
      e.cta_url_placeholder
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${product?.name || 'sendrix'}-onboarding.csv`
    a.click()
  }

  const selectedEmail = emails.find(e => e.id === selectedId)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F3EC] min-h-screen">
        <div className="flex flex-col items-center gap-6">
          <SequenceOrbitLoader label="Finalising your sequence" />
          <div className="text-center">
            <p className="text-[#888780] text-sm font-medium">Polishing up those conversion hooks.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full bg-[#F5F3EC] min-h-screen font-sans selection:bg-[#E1F5EE] selection:text-[#04342C]">
      
      {/* Premium Header */}
      <div className="bg-white border-b border-[#D3D1C7] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/app/dashboard" className="p-2 hover:bg-[#F5F3EC] rounded-xl transition-colors">
               <img src="/sendrix_icon.png" alt="Sendrix" className="h-6 w-6" />
            </Link>
            <div className="h-6 w-[1px] bg-[#D3D1C7]"></div>
            <div>
              <div className="flex items-center gap-2 text-[#888780] text-[10px] font-black uppercase tracking-widest mb-0.5">
                <Zap className="w-3 h-3 text-[#EF9F27] fill-[#EF9F27]" />
                Ready to Publish
              </div>
              <h1 className="text-lg font-black text-[#0e0e10] flex items-center gap-2">
                {product?.name || 'Your Product'} 
                <span className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] px-2 py-0.5 rounded-md self-center">
                  {emails.length} EMAIL{emails.length !== 1 ? 'S' : ''}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowBrief(!showBrief)}
               className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showBrief ? 'bg-[#04342C] text-white' : 'text-[#5F5E5A] hover:bg-[#F5F3EC]'}`}
             >
               <FileText className="w-4 h-4" /> Brief
             </button>
             <button 
               onClick={exportCSV}
               className="hidden md:flex items-center gap-2 px-4 py-2 text-[#5F5E5A] hover:bg-[#F5F3EC] rounded-xl text-sm font-bold transition-all"
             >
               <Download className="w-4 h-4" /> Export
             </button>
             {!resendConnected ? (
               <button 
                 onClick={() => setShowResendModal(true)}
                 className="bg-[#04342C] text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-xl hover:bg-[#03261F] transition-all flex items-center gap-2"
               >
                 Connect Resend <ArrowRight className="w-4 h-4" />
               </button>
             ) : (
               <button 
                  onClick={handleActivate}
                  disabled={activating}
                  className="bg-[#04342C] text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-xl hover:bg-[#03261F] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" /> {activating ? 'Activating...' : 'Activate Sequence'}
                </button>
             )}
          </div>
        </div>
      </div>

      {showPlanSummary && account && (
        <div className="max-w-[1440px] mx-auto px-6 mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F6E56]">{account.planLabel}</span>
            <span className="text-sm font-semibold text-[#0e0e10]">{account.priceLabel}</span>
          </div>
          <div className="text-[11px] text-[#888780] uppercase tracking-[0.2em]">
            {formatEmailLimitText(account?.limits?.maxEmailsPerMonth)}
          </div>
        </div>
      )}
      {showPlanOptions && (
        <div className="max-w-[1440px] mx-auto px-6 mt-4">
          <div className="mb-4 text-xs uppercase tracking-[.3em] text-[#888780] font-black">Subscription plans</div>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.values(PLAN_CONFIG).map((plan) => (
              <div key={plan.label} className="border border-[#D3D1C7] rounded-[18px] bg-white p-4 shadow-sm text-sm">
                <div className="text-[11px] uppercase tracking-[.2em] text-[#888780]">{plan.label}</div>
                <div className="mt-2 text-2xl font-black text-[#0e0e10]">{plan.priceLabel}</div>
                <p className="mt-3 text-[11px] text-[#5F5E5A]">{plan.maxProducts === null ? 'Unlimited workspaces' : `${plan.maxProducts} workspace${plan.maxProducts === 1 ? '' : 's'}`}</p>
                <p className="text-[11px] text-[#5F5E5A]">{formatEmailLimitText(plan.maxEmailsPerMonth)}</p>
                <button
                  onClick={() => router.push('/app/settings?tab=billing')}
                  className="mt-4 w-full rounded-xl border border-[#D3D1C7] py-2 text-[11px] font-bold uppercase tracking-[.2em] text-[#04342C]"
                >
                  Choose plan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Left Col: Sequence & Brief */}
        <div className="space-y-6 lg:sticky lg:top-28">
           
           {isFoundingMember && (
             <div className="bg-[#0e0e10] p-4 rounded-2xl shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                  <Zap className="w-12 h-12 text-[#EF9F27] fill-[#EF9F27]" />
               </div>
               <div className="flex items-center gap-3 text-[#EF9F27] mb-1">
                 <CheckCircle2 className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Founding Member</span>
               </div>
               <p className="text-white text-xs font-bold leading-relaxed pr-8">
                 Locked in at <span className="text-[#EF9F27]">$19/mo</span> forever. All future features included.
               </p>
             </div>
           )}

           {/* Email List Sidebar */}
           <div className="space-y-2">
             <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-[10px] font-black text-[#888780] uppercase tracking-widest">Automation Timeline</span>
                <span className="text-[10px] font-bold text-[#0F6E56] bg-[#E1F5EE] px-2 py-0.5 rounded">AUTO-PIPELINE</span>
             </div>
             {emails.length > 0 ? (
               emails.map((email) => {
                 const isActive = selectedId === email.id
                 return (
                   <button
                     key={email.id}
                     onClick={() => setSelectedId(email.id)}
                     className={`w-full group relative text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                       isActive 
                         ? 'bg-white border-[#04342C] shadow-lg translate-x-1' 
                         : 'bg-white/50 border-[#D3D1C7] hover:border-[#04342C]/40 hover:bg-white'
                     }`}
                   >
                     <div className={`shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-colors ${
                       isActive ? 'bg-[#04342C] text-white' : 'bg-[#E1F5EE] text-[#04342C]'
                     }`}>
                       <span className="text-[8px] font-black opacity-60 uppercase">Day</span>
                       <span className="font-black text-sm -mt-1">{email.send_delay_days}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 transition-colors ${
                         isActive ? 'text-[#1D9E75]' : 'text-[#888780]'
                       }`}>
                         {email.email_type.replace('_', ' ')}
                       </div>
                       <div className={`font-bold text-sm truncate ${isActive ? 'text-[#0e0e10]' : 'text-[#5F5E5A]'}`}>
                         {email.subject}
                       </div>
                     </div>
                     <ChevronRight className={`w-4 h-4 transition-all ${isActive ? 'text-[#04342C] translate-x-1' : 'text-[#D3D1C7] opacity-0 group-hover:opacity-100'}`} />
                   </button>
                 )
               })
             ) : (
               <div className="p-8 text-center bg-white/50 border border-dashed border-[#D3D1C7] rounded-2xl">
                 <p className="text-xs font-bold text-[#888780] mb-3">No emails found in this sequence.</p>
                 <button 
                  onClick={() => router.push('/workspace-setup/brief')}
                  className="text-[10px] font-black text-[#04342C] uppercase tracking-wider underline"
                 >
                   Try Generating Again
                 </button>
               </div>
             )}
           </div>

            {/* Go Live Card */}
             <div className="p-6 rounded-2xl shadow-sm border bg-white border-[#D3D1C7]">
                <div className="text-center">
                  <div className={`w-10 h-10 ${resendConnected ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#F5F3EC] text-[#5F5E5A]'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    {resendConnected ? <CheckCircle2 className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                  </div>
                  <h4 className="font-black text-[#0e0e10] text-sm mb-1">
                    {resendConnected ? 'Resend Connected' : 'Next Step: Go Live'}
                  </h4>
                  <p className="text-[10px] text-[#5F5E5A] font-bold mb-4">
                    {resendConnected ? 'Your account is ready to send.' : 'Connect Resend to activate flow.'}
                  </p>
                  {!resendConnected ? (
                    <Link 
                      href="/app/resend"
                      className="flex items-center justify-center gap-2 text-xs font-black text-white bg-[#04342C] py-2.5 rounded-xl hover:bg-[#03261F] transition-all"
                    >
                      Finish Setup <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button 
                      onClick={handleActivate}
                      disabled={activating}
                      className="w-full flex items-center justify-center gap-2 text-xs font-black text-white bg-[#04342C] py-2.5 rounded-xl hover:bg-[#03261F] transition-all disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3" /> {activating ? 'Activating...' : 'Activate Sequence'}
                    </button>
                  )}
                </div>
             </div>

           {/* Regeneration Action */}
           <div className="p-6 bg-white border border-[#D3D1C7] rounded-2xl shadow-sm text-center">
              <p className="text-xs text-[#5F5E5A] font-bold mb-4">Don't like the tone? Adjust brief.</p>
              <button 
                onClick={() => router.push(`/workspace-setup/brief?productId=${searchParams.get('productId')}`)}
                className="w-full flex items-center justify-center gap-2 text-sm font-black text-[#04342C] hover:text-[#0F6E56] transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Edit & Regenerate
              </button>
           </div>
        </div>

        {/* Right Col: Preview/Editor & Brief Details */}
        <div className="space-y-6">
          
          {/* Brief Summary Sidebar (Toggled) */}
          {showBrief && (
            <div className="bg-[#04342C] text-white p-8 rounded-3xl animate-fadeIn shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <FileText className="w-24 h-24" />
               </div>
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-[#E1F5EE]">Input Brief</h2>
                 <button onClick={() => setShowBrief(false)} className="text-[#888780] hover:text-white transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { label: 'Target User', value: product?.brief?.target_user },
                   { label: 'Aha! Moment', value: product?.brief?.activation_action },
                   { label: 'Core Problem', value: product?.brief?.core_problem },
                   { label: 'Paywall Incentive', value: product?.brief?.upgrade_incentive },
                 ].map((item, i) => (
                   <div key={i} className="space-y-1">
                     <span className="text-[10px] font-black text-[#1D9E75] uppercase tracking-widest">{item.label}</span>
                     <p className="text-sm font-bold text-white/90 leading-snug">{item.value || 'N/A'}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {selectedEmail ? (
            <div className="flex flex-col gap-6 min-w-0">
              {/* Workspace Toolbar */}
              <div className="bg-white border border-[#D3D1C7] p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex bg-[#F5F3EC] p-1 rounded-xl w-full sm:w-auto">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isEditing ? 'bg-white text-[#04342C] shadow-sm' : 'text-[#888780]'}`}
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${isEditing ? 'bg-white text-[#04342C] shadow-sm' : 'text-[#888780]'}`}
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {!isEditing && (
                    <div className="flex bg-[#F5F3EC] p-1 rounded-xl mr-2">
                       <button 
                         onClick={() => setPreviewMode('desktop')}
                         className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white text-[#04342C] shadow-sm' : 'text-[#888780]'}`}
                       >
                         <Monitor className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => setPreviewMode('mobile')}
                         className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white text-[#04342C] shadow-sm' : 'text-[#888780]'}`}
                       >
                         <Smartphone className="w-4 h-4" />
                       </button>
                    </div>
                  )}
                   <button 
                     onClick={() => {
                        const text = `${selectedEmail.subject}\n\n${selectedEmail.body}`
                        navigator.clipboard.writeText(text)
                        setCopySuccess(true)
                        setTimeout(() => setCopySuccess(false), 2000)
                     }}
                     className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5F5E5A] hover:bg-[#F5F3EC] rounded-xl transition-all"
                   >
                     {copySuccess ? <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" /> : <Copy className="w-4 h-4" />}
                     {copySuccess ? 'Copied' : 'Copy Text'}
                   </button>
                </div>
              </div>

              {/* Viewport Wrapper */}
              <div className={`flex justify-center transition-all duration-500 ${previewMode === 'mobile' && !isEditing ? 'px-0' : 'w-full'}`}>
                <div className={`bg-white border rounded-[32px] transition-all duration-300 w-full ${previewMode === 'mobile' && !isEditing ? 'max-w-[375px] shadow-2xl' : 'shadow-sm'} ${isEditing ? 'border-[#04342C] shadow-2xl p-8' : 'border-[#D3D1C7] overflow-hidden'}`}>
                  {isEditing ? (
                    /* High-Fidelity Editor */
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#888780] uppercase tracking-widest px-1">Subject Line</label>
                          <input 
                            value={selectedEmail.subject}
                            onChange={(e) => handleUpdate(selectedEmail.id, 'subject', e.target.value)}
                            className="w-full bg-[#F5F3EC] border-2 border-transparent focus:border-[#04342C] outline-none rounded-xl px-4 py-3.5 font-bold text-[#0e0e10] transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#888780] uppercase tracking-widest px-1">Preview Text</label>
                          <input 
                            value={selectedEmail.preview_text}
                            onChange={(e) => handleUpdate(selectedEmail.id, 'preview_text', e.target.value)}
                            className="w-full bg-[#F5F3EC] border-2 border-transparent focus:border-[#04342C] outline-none rounded-xl px-4 py-3.5 font-medium text-[#5F5E5A] transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#888780] uppercase tracking-widest px-1">Email Content</label>
                        <textarea 
                          value={selectedEmail.body}
                          onChange={(e) => handleUpdate(selectedEmail.id, 'body', e.target.value)}
                          rows={14}
                          className="w-full bg-[#F5F3EC] border-2 border-transparent focus:border-[#04342C] outline-none rounded-2xl px-6 py-5 font-mono text-sm leading-relaxed text-[#0e0e10] transition-all resize-none shadow-inner"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#F5F3EC] rounded-2xl border border-[#D3D1C7]/50">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#888780] uppercase tracking-widest px-1">Main Button (CTA)</label>
                          <div className="relative">
                            <MousePointer2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888780]" />
                            <input 
                              value={selectedEmail.cta_text}
                              onChange={(e) => handleUpdate(selectedEmail.id, 'cta_text', e.target.value)}
                              className="w-full bg-white border-2 border-transparent focus:border-[#04342C] outline-none rounded-xl pl-12 pr-4 py-3.5 font-bold text-[#0e0e10] transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#888780] uppercase tracking-widest px-1">Target URL</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888780]" />
                            <input 
                              value={selectedEmail.cta_url_placeholder}
                              onChange={(e) => handleUpdate(selectedEmail.id, 'cta_url_placeholder', e.target.value)}
                              className="w-full bg-white border-2 border-transparent focus:border-[#04342C] outline-none rounded-xl pl-12 pr-4 py-3.5 font-mono text-[11px] text-[#5F5E5A] transition-all shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <div className="flex items-center gap-2 text-[#888780] text-xs font-bold">
                           <Info className="w-4 h-4" />
                           All changes are saved automatically.
                        </div>
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="bg-[#04342C] text-white px-10 py-4 rounded-2xl font-black shadow-2xl hover:bg-[#03261F] transition-all"
                        >
                           Done Editing
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* World-Class Outlook/Gmail Preview */
                    <div className="flex flex-col bg-white">
                      {/* Email Metadata Header */}
                      <div className={`p-8 border-b border-[#F5F3EC] bg-white ${previewMode === 'mobile' ? 'px-6' : ''}`}>
                         <div className="flex items-start gap-4 mb-8">
                           <div className="w-12 h-12 bg-[#04342C] rounded-2xl flex items-center justify-center text-white font-black shrink-0 shadow-lg transform rotate-3">
                              {product?.name?.[0] || 'S'}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-1">
                                <h3 className="font-extrabold text-[#0e0e10] text-lg leading-none">{product?.name || 'Your Team'}</h3>
                                <span className={`text-[9px] font-black text-[#888780] bg-[#F5F3EC] px-2 py-1 rounded tracking-widest ${previewMode === 'mobile' ? 'hidden' : ''}`}>{product?.id ? `REF-${product.id.substring(0, 5).toUpperCase()}` : 'REF-X1'}</span>
                             </div>
                             <div className="flex items-center gap-2 text-xs">
                                <span className="text-[#888780] font-medium italic">Sent to</span>
                                <span className="text-[#04342C] font-black border-b border-[#04342C]/20">{userEmail}</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className="space-y-3">
                            <h2 className={`font-black text-[#0e0e10] leading-tight ${previewMode === 'mobile' ? 'text-xl' : 'text-3xl'}`}>
                               {selectedEmail.subject}
                            </h2>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-[#1D9E75] bg-[#E1F5EE] px-1.5 py-0.5 rounded">PREVIEW</span>
                               <p className="text-sm text-[#5F5E5A] font-medium line-clamp-1 italic">"{selectedEmail.preview_text}"</p>
                            </div>
                         </div>
                      </div>

                      {/* Professional Email Surface */}
                      <div className={`bg-[#FFFFFF] ${previewMode === 'mobile' ? 'p-6' : 'p-12 md:p-16'}`}>
                         <div className="max-w-2xl mx-auto w-full text-[#0e0e10]">
                            <div className="prose prose-slate max-w-none text-left">
                               {selectedEmail.body.split('\n').map((line, i) => (
                                 <p key={i} className={`mb-5 leading-relaxed font-bold ${previewMode === 'mobile' ? 'text-[15px]' : 'text-[17px]'} ${line.trim() === '' ? 'h-4' : ''}`}>
                                   {line}
                                 </p>
                               ))}
                            </div>

                            {/* Elevated CTA Button */}
                            <div className="mt-16 mb-12">
                               <div className="group relative inline-flex items-center gap-4 bg-[#0e0e10] text-white px-10 py-5 rounded-[20px] font-black transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                                  {selectedEmail.cta_text}
                                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                  <div className="absolute inset-0 rounded-[20px] bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                               </div>
                               <p className="mt-4 text-[10px] text-[#888780] font-bold uppercase tracking-widest pl-2">
                                 Link: {selectedEmail.cta_url_placeholder}
                               </p>
                            </div>

                            {/* Standard Email Footer */}
                            <div className="mt-20 pt-10 border-t border-[#F5F3EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#888780] font-bold text-[11px] tracking-tight">
                               <div className="flex items-center gap-2">
                                 <div className="p-1.5 bg-[#F5F3EC] rounded-lg">
                                    <Mail className="w-3.5 h-3.5" />
                                 </div>
                                 Powered by {product?.name || 'Sendrix'} Engineering
                               </div>
                               <div className="flex items-center gap-6">
                                 <span className="hover:text-[#04342C] transition-colors cursor-pointer underline decoration-[#D3D1C7]">Preference Center</span>
                                 <span className="hover:text-[#04342C] transition-colors cursor-pointer underline decoration-[#D3D1C7]">Unsubscribe</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-32 border-2 border-dashed border-[#D3D1C7] rounded-[40px] text-[#888780] bg-white/30 backdrop-blur-sm">
                <Zap className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-black text-sm uppercase tracking-widest mb-2">
                  {emails.length === 0 ? 'No emails to display' : 'Select an email to begin review'}
                </p>
                {emails.length === 0 && (
                  <button 
                    onClick={() => router.push('/workspace-setup/brief')}
                    className="text-xs font-bold text-[#04342C] underline decoration-[#04342C]/20 hover:decoration-[#04342C]"
                  >
                    Go back and generate again
                  </button>
                )}
             </div>
          )}
        </div>
      </div>
      {/* Integration Modal */}
      {showResendModal && (
        <div className="fixed inset-0 bg-[#0e0e10]/80 flex items-center justify-center z-[110] backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-[#04342C] p-10 text-white relative">
               <button 
                 onClick={() => setShowResendModal(false)}
                 className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
               <div className="inline-block bg-[#E1F5EE] text-[#04342C] text-[10px] font-black uppercase tracking-[.2em] px-3 py-1 rounded-full mb-4">
                 Resend setup
               </div>
               <h2 className="text-3xl font-black mb-3">Connect Resend</h2>
               <p className="text-[#E1F5EE]/70 text-sm font-medium leading-relaxed">
                 Authorize Sendrix to use Resend for delivery. Once connected, we can start sending your onboarding emails.
               </p>
            </div>

            <form
              className="p-10 space-y-6"
              onSubmit={async (event) => {
                event.preventDefault()
                const { apiKey, fromName, fromEmail } = resendForm
                if (!apiKey || !fromName || !fromEmail) {
                  setModalError('All fields are required')
                  return
                }
                setConnecting(true)
                setModalError('')
                try {
                  const res = await fetch('/api/resend/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey, fromName, fromEmail })
                  })
                  if (!res.ok) {
                    const payload = await res.json().catch(() => ({}))
                    throw new Error(payload.error || 'Verification failed')
                  }
                  setResendConnected(true)
                  setShowResendModal(false)
                  router.push('/app/dashboard')
                } catch (err: any) {
                  setModalError(err?.message || 'Unable to connect right now.')
                } finally {
                  setConnecting(false)
                }
              }}
            >
              <div>
                <label className="text-[10px] font-black uppercase tracking-[.2em] text-[#0e0e10]">Resend API key</label>
                <input
                  value={resendForm.apiKey}
                  onChange={(e) => setResendForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full mt-2 rounded-xl border border-[#D3D1C7] bg-[#F5F3EC] px-4 py-3 text-sm"
                  placeholder="re_xxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[.2em] text-[#0e0e10]">From name</label>
                <input
                    value={resendForm.fromName}
                    onChange={(e) => setResendForm((prev) => ({ ...prev, fromName: e.target.value }))}
                    className="w-full mt-2 rounded-xl border border-[#D3D1C7] bg-[#F5F3EC] px-4 py-3 text-sm"
                    placeholder="Jane from Sendrix"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[.2em] text-[#0e0e10]">From email</label>
                  <input
                    value={resendForm.fromEmail}
                    onChange={(e) => setResendForm((prev) => ({ ...prev, fromEmail: e.target.value }))}
                    className="w-full mt-2 rounded-xl border border-[#D3D1C7] bg-[#F5F3EC] px-4 py-3 text-sm"
                    placeholder="hello@yourdomain.com"
                  />
                </div>
              </div>
              {modalError && (
                <div className="text-sm text-[#D85A30]">{modalError}</div>
              )}
              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#04342C] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#03261F] transition"
                  disabled={connecting}
                >
                  {connecting ? 'Connecting...' : 'Connect Resend'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResendModal(false)
                    router.push('/app/dashboard')
                  }}
                  className="flex-1 px-6 py-3 border border-[#D3D1C7] rounded-xl font-bold text-sm text-[#0e0e10] bg-white hover:border-[#04342C] transition"
                  disabled={connecting}
                >
                  Skip for now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIntegrationModal && (
        <div className="fixed inset-0 bg-[#0e0e10]/60 flex items-center justify-center z-[100] backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-[#04342C] p-10 text-white relative">
               <button 
                 onClick={() => setShowIntegrationModal(false)}
                 className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
               <div className="inline-block bg-[#E1F5EE] text-[#04342C] text-[10px] font-black uppercase tracking-[.2em] px-3 py-1 rounded-full mb-4">
                 Sequence Active
               </div>
               <h2 className="text-3xl font-black mb-3">How to start sending</h2>
               <p className="text-[#E1F5EE]/70 text-sm font-medium leading-relaxed">
                 Your sequence is live! Now just ping our webhook whenever a user signs up on your app.
               </p>
            </div>

            <div className="p-10 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-[#0F6E56]" />
                  <span className="text-[10px] font-black text-[#0e0e10] uppercase tracking-widest">Your Webhook URL</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#F5F3EC] border border-[#D3D1C7] rounded-xl px-4 py-3 text-sm font-bold text-[#04342C] truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/${localStorage.getItem('sendrix_current_product_id')}` : ''}
                  </div>
                  <button 
                    onClick={() => {
                      const pid = localStorage.getItem('sendrix_current_product_id');
                      const url = `${window.location.origin}/api/webhook/${pid}`;
                      navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="bg-[#04342C] text-white px-6 rounded-xl font-bold text-sm hover:bg-[#03261F] transition-all flex items-center gap-2"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-[#0F6E56]" />
                  <span className="text-[10px] font-black text-[#0e0e10] uppercase tracking-widest">Node.js Snippet</span>
                </div>
                <div className="bg-[#0e0e10] rounded-2xl p-6 overflow-x-auto">
                  <pre className="text-[#E1F5EE] text-[11px] font-mono leading-relaxed">
{`// Call this on user registration
fetch('${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/${localStorage.getItem('sendrix_current_product_id')}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    name: 'Customer Name' 
  })
})`}
                  </pre>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F5F3EC] flex justify-center">
                 <button 
                   onClick={() => router.push('/app/dashboard')}
                   className="bg-[#E1F5EE] text-[#04342C] px-10 py-3 rounded-xl font-black text-sm hover:bg-[#D3EBE3] transition-all"
                 >
                   Go to Dashboard
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
