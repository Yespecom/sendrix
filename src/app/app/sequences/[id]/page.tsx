'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SendrixLoader from '@/components/SendrixLoader'
import { 
  ChevronDown, ChevronUp, Zap, Download, RefreshCw, Check, Clock, Mail, 
  Smile, Rocket, Lightbulb, Star, Diamond, Flame, AlertTriangle, Sparkles,
  Receipt, BarChart3, PenTool, Package, MessageSquare, Bell, Calendar, Wrench, Target, TrendingUp, DollarSign, Sprout,
  Globe, X, Eye, Palette
} from 'lucide-react'
import { EMAIL_DESIGN_TEMPLATES, renderEmailTemplateHtml } from '@/lib/email-design-templates'

const ICON_MAP: Record<string, any> = {
  'receipt': Receipt, 'check': Check, 'chart': BarChart3, 'rocket': Rocket,
  'pen': PenTool, 'package': Package, 'message': MessageSquare, 'bell': Bell,
  'calendar': Calendar, 'idea': Lightbulb, 'tool': Wrench, 'target': Target,
  'trend': TrendingUp, 'money': DollarSign, 'leaf': Sprout, 'bolt': Zap,
}

const EMAIL_TYPE_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  welcome:       { label: 'Welcome',       color: '#0F6E56', bg: '#E1F5EE', icon: Smile },
  activation:    { label: 'Activation',    color: '#1D4ED8', bg: '#EEF2FF', icon: Rocket },
  value:         { label: 'Value',         color: '#7C3AED', bg: '#F3E8FF', icon: Lightbulb },
  social_proof:  { label: 'Social Proof',  color: '#B45309', bg: '#FEF3C7', icon: Star },
  objection_handling: { label: 'Friction Remover', color: '#6366f1', bg: '#eef2ff', icon: AlertTriangle },
  upgrade:       { label: 'Upgrade',       color: '#BE185D', bg: '#FCE7F3', icon: Diamond },
  upgrade_nudge: { label: 'Upgrade Nudge', color: '#D85A30', bg: '#FEE2E2', icon: Flame },
}

function getEmailMeta(type: string) {
  return EMAIL_TYPE_META[type?.toLowerCase()] || { label: type || 'Email', color: '#5F5E5A', bg: '#F5F3EC', icon: Mail }
}

export default function SequencePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const [sequence, setSequence] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [resendConnected, setResendConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(0)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [activating, setActivating] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewMode, setPreviewMode] = useState<Record<number, boolean>>({}) // track which card is in preview mode
  const [userEmail, setUserEmail] = useState('user@customer.io')
  const [designKey, setDesignKey] = useState('clean_minimal')
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  const showToastMsg = (msg: string) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    setShowToast(true)
    toastTimer.current = setTimeout(() => setShowToast(false), 2600)
  }

  useEffect(() => {
    const load = async () => {
      const [res, session] = await Promise.all([
        fetch(`/api/sequences/${params.id}`),
        import('next-auth/react').then(m => m.getSession())
      ])
      if (session?.user?.email) setUserEmail(session.user.email)
      if (!res.ok) { setError('Could not load sequence.'); setLoading(false); return }
      const data = await res.json()
      setSequence(data.sequence)
      setProduct(data.product)
      setResendConnected(data.resendConnected)
      if (data.sequence?.design_key) setDesignKey(data.sequence.design_key)
      setLoading(false)
    }
    load()
  }, [params.id])

  const persistEmailUpdate = useCallback((index: number, patch: Record<string, any>) => {
    setSequence((prev: any) => {
      const updated = [...prev.emails]
      updated[index] = { ...updated[index], ...patch }
      const newSeq = { ...prev, emails: updated }

      // Debounced auto-save
      clearTimeout(saveTimers.current[index])
      setSavingId(index)
      setSavedId(null)
      saveTimers.current[index] = setTimeout(async () => {
        await fetch(`/api/sequences/${params.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: updated }),
        })
        setSavingId(null)
        setSavedId(index)
        setTimeout(() => setSavedId(null), 2000)
      }, 800)

      return newSeq
    })
  }, [params.id])

  const handleDesignChange = async (key: string) => {
    setDesignKey(key)
    setSequence((prev: any) => ({ ...prev, design_key: key }))
    await fetch(`/api/sequences/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ design_key: key }),
    })
    showToastMsg('Design template updated')
  }

  const handleUpdate = useCallback((index: number, field: string, value: any) => {
    persistEmailUpdate(index, { [field]: value })
  }, [persistEmailUpdate])

  const handleActivate = async () => {
    if (!resendConnected) { router.push('/app/resend'); return }
    setActivating(true)
    const res = await fetch(`/api/sequences/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    setActivating(false)
    if (res.ok) {
      setSequence((prev: any) => ({ ...prev, status: 'active' }))
      showToastMsg('Sequence activated!')
      setShowIntegrationModal(true)
    }
  }

  const handleDeactivate = async () => {
    setDeactivating(true)
    const res = await fetch(`/api/sequences/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    })
    setDeactivating(false)
    if (res.ok) {
      setSequence((prev: any) => ({ ...prev, status: 'draft' }))
      showToastMsg('Sequence deactivated')
    }
  }

  const exportCSV = () => {
    if (!sequence?.emails) return
    const headers = ['Day', 'Type', 'Subject', 'Body']
    const rows = sequence.emails.map((e: any) => [
      e.send_delay_days,
      e.email_type,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      `"${(e.body || '').replace(/"/g, '""')}"`,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${product?.name || 'sequence'}-emails.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <SendrixLoader label="Loading sequence..." />
        </div>
      </div>
    )
  }

  if (error || !sequence) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#0F6E56', border: '1px solid #0F6E56' }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0e0e10', marginBottom: 8 }}>No sequence found</h2>
          <p style={{ color: '#5F5E5A', marginBottom: 24 }}>{error || 'This workspace has no sequence yet.'}</p>
          <button
            onClick={() => router.push(`/workspace-setup/brief?productId=${params.id}`)}
            style={{ background: '#04342C', color: '#fff', padding: '10px 24px', borderRadius: 10, fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Generate sequence →
          </button>
        </div>
      </div>
    )
  }

  const isActive = sequence?.status === 'active'
  const emails: any[] = sequence?.emails || []

  return (
    <div style={{ minHeight: '100%', background: '#F5F3EC', padding: '0 0 80px' }}>
      <style jsx global>{`
        @keyframes modalSlideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (max-width: 639px) {
          .action-bar { flex-direction: column !important; align-items: stretch !important; }
          .action-bar-buttons { width: 100% !important; justify-content: stretch !important; flex-wrap: wrap !important; }
          .action-bar-buttons button { flex: 1 !important; justify-content: center !important; }
          .email-card-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .email-card-actions { width: 100% !important; justify-content: flex-end !important; }
        }
      `}</style>

      {/* Page header */}
      <div className="px-5 md:px-8 pt-8 md:pt-10">
        <div style={{ marginBottom: 20 }}>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '.12em', display: 'flex', alignItems: 'center', gap: 6 }}>
              {(() => {
                const WS_ICON = ICON_MAP[product?.brief?.emoji || ''] || Rocket
                return <WS_ICON size={12} />
              })()}
              {product?.name}
            </div>
            <div className={`
              inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase
              ${isActive ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#f0ede6] text-[#888780]'}
            `}>
              <span className={`w-1 h-1 rounded-full bg-current ${isActive ? 'animate-pulse' : ''}`} />
              {isActive ? 'Active' : 'Draft'}
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0e0e10] tracking-tight">
            Email sequence
          </h1>
          <p className="text-sm text-[#5F5E5A] mt-1">
            {emails.length} emails · Edit subjects and body copy, then activate when ready.
          </p>
        </div>

        {/* Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          {!resendConnected && (
            <div
              onClick={() => router.push('/app/resend')}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#FEF3C7] border border-[#EF9F27] cursor-pointer"
            >
              <AlertTriangle size={16} color="#B45309" />
              <span className="text-xs font-bold text-[#92400E]">Connect Resend to activate sequence</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button
              onClick={() => router.push(`/workspace-setup/brief?productId=${params.id}`)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D3D1C7] bg-white text-[#5F5E5A] text-sm font-bold hover:bg-[#F5F3EC] transition-colors"
            >
              <RefreshCw size={14} /> <span className="hidden xs:inline">Regenerate</span><span className="xs:hidden">Refresh</span>
            </button>
            <button
              onClick={exportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D3D1C7] bg-white text-[#5F5E5A] text-sm font-bold hover:bg-[#F5F3EC] transition-colors"
            >
              <Download size={14} /> Export
            </button>
            {isActive ? (
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] text-sm font-bold hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
              >
                <X size={14} />
                {deactivating ? 'Deactivating…' : 'Deactivate'}
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={activating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#04342C] text-white text-sm font-bold shadow-lg shadow-[#04342C]/20 hover:bg-[#03261F] transition-all disabled:opacity-50"
              >
                <Zap size={14} className="fill-current" />
                {activating ? 'Activating…' : 'Activate sequence'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div style={{ padding: '0 clamp(16px, 4vw, 32px)', marginBottom: 32 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #D3D1C7', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Palette size={16} color="#0F6E56" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0e0e10' }}>Email Design Template</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {EMAIL_DESIGN_TEMPLATES.map(t => (
              <div 
                key={t.key}
                onClick={() => handleDesignChange(t.key)}
                style={{ 
                  padding: 12, borderRadius: 12, border: `1.5px solid ${designKey === t.key ? '#04342C' : '#F5F3EC'}`,
                  background: designKey === t.key ? '#E1F5EE' : '#F5F3EC', cursor: 'pointer', transition: 'all .2s'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: designKey === t.key ? '#04342C' : '#5F5E5A', marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: designKey === t.key ? '#0F6E56' : '#888780', lineHeight: 1.3 }}>{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email cards */}
      <div style={{ padding: '0 clamp(16px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {emails.map((email: any, index: number) => {
          const isOpen = expandedId === index
          const meta = getEmailMeta(email.email_type)
          const isSaving = savingId === index
          const isSaved = savedId === index

          return (
            <div
              key={index}
              style={{
                background: '#fff',
                borderRadius: 14,
                border: `1.5px solid ${isOpen ? '#04342C' : '#D3D1C7'}`,
                overflow: 'hidden',
                boxShadow: isOpen ? '0 4px 24px rgba(4,52,44,.1)' : '0 1px 3px rgba(4,52,44,.04)',
                transition: 'all .2s',
              }}
            >
              {/* Card header */}
              <div
                onClick={() => setExpandedId(isOpen ? null : index)}
                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
              >
                {/* Day badge */}
                <div style={{
                  width: 52, height: 52, borderRadius: 11, background: isOpen ? '#04342C' : '#F5F3EC',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background .2s'
                }}>
                  <Clock size={11} color={isOpen ? 'rgba(255,255,255,.6)' : '#888780'} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: isOpen ? '#fff' : '#0e0e10', lineHeight: 1 }}>
                    {email.send_delay_days}
                  </span>
                  <span style={{ fontSize: 9, color: isOpen ? 'rgba(255,255,255,.5)' : '#888780', fontWeight: 600 }}>DAY</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      background: meta.bg, color: meta.color,
                    }}>
                      <meta.icon size={11} /> {meta.label}
                    </span>
                    {isSaving && <span style={{ fontSize: 10, color: '#888780', fontWeight: 500 }}>Saving…</span>}
                    {isSaved && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#0F6E56', fontWeight: 600 }}>
                        <Check size={10} /> Saved
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0e0e10', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.subject || <span style={{ color: '#888780', fontStyle: 'italic' }}>No subject</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewMode(prev => ({ ...prev, [index]: !prev[index] })) }}
                    style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: previewMode[index] ? '#04342C' : '#888780' }}
                  >
                    {previewMode[index] ? <PenTool size={16} /> : <Eye size={16} />}
                  </button>
                  <div style={{ color: '#888780' }}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* Expanded editor */}
              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #edeae2', background: '#FAFAF8' }}>
                  <div style={{ paddingTop: 16 }}>
                    {previewMode[index] ? (
                      <div style={{ marginTop: 20, background: '#fff', border: '1px solid #edeae2', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0ede6', background: '#fafaf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ fontSize: 11, fontWeight: 700, color: '#888780', textTransform: 'uppercase', letterSpacing: '.05em' }}>Realtime Preview</div>
                           <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600 }}>Theme: {EMAIL_DESIGN_TEMPLATES.find(t => t.key === designKey)?.label}</div>
                        </div>
                        <div style={{ padding: '20px', background: '#f5f3ec' }}>
                          <iframe 
                            srcDoc={renderEmailTemplateHtml({
                              templateKey: designKey,
                              subject: email.subject,
                              body: email.body,
                              ctaText: email.cta_text,
                              ctaUrl: email.cta_url,
                              productName: product?.name,
                              dayIndex: email.send_delay_days,
                              senderName: product?.name || 'Founder'
                            })}
                            style={{ 
                              width: '100%', 
                              height: '540px', 
                              border: 'none', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 24px rgba(4,52,44,.08)',
                              background: '#fff'
                            }}
                            title={`Preview for email ${index}`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '.06em' }}>Subject</label>
                            <span style={{ fontSize: 10, color: '#888780' }}>{email.subject?.length || 0}/70</span>
                          </div>
                          <input
                            value={email.subject || ''}
                            onChange={e => handleUpdate(index, 'subject', e.target.value)}
                            style={{
                              width: '100%', padding: '10px 14px', borderRadius: 9,
                              border: '1.5px solid #D3D1C7', background: '#fff',
                              fontSize: 15, fontWeight: 600, color: '#0e0e10', outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'block' }}>Body</label>
                          <textarea
                            value={email.body || ''}
                            onChange={e => handleUpdate(index, 'body', e.target.value)}
                            rows={10}
                            style={{
                              width: '100%', padding: '12px 14px', borderRadius: 9,
                              border: '1.5px solid #D3D1C7', background: '#fff',
                              fontSize: 13, color: '#0e0e10', lineHeight: 1.7, outline: 'none', resize: 'vertical', minHeight: 160, boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'block' }}>CTA Text</label>
                            <input
                              value={email.cta_text || ''}
                              onChange={e => handleUpdate(index, 'cta_text', e.target.value)}
                              placeholder="e.g. Get Started"
                              style={{
                                width: '100%', padding: '10px 14px', borderRadius: 9,
                                border: '1.5px solid #D3D1C7', background: '#fff',
                                fontSize: 14, color: '#0e0e10', outline: 'none', boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, display: 'block' }}>CTA Link</label>
                            <div style={{ display: 'flex', borderRadius: 9, border: '1.5px solid #D3D1C7', background: '#fff', overflow: 'hidden', transition: 'border-color .2s' }}>
                              <div style={{ 
                                padding: '0 12px', 
                                background: '#E1F5EE', 
                                color: '#0F6E56', 
                                fontSize: 12, 
                                fontWeight: 800, 
                                borderRight: '1.5px solid #D3D1C7', 
                                display: 'flex', 
                                alignItems: 'center',
                                userSelect: 'none'
                              }}>
                                HTTPS://
                              </div>
                              <input
                                value={email.cta_url?.replace(/^https?:\/\//, '') || ''}
                                onChange={e => {
                                  const val = e.target.value.trim().replace(/^https?:\/\//, '');
                                  handleUpdate(index, 'cta_url', val ? `https://${val}` : '');
                                }}
                                placeholder="app.yoursite.com/signup"
                                style={{
                                  flex: 1, padding: '10px 14px', border: 'none', 
                                  background: 'transparent', fontSize: 14, 
                                  color: '#0e0e10', outline: 'none', boxSizing: 'border-box'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '.06em' }}>Send delay</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="number" min={0} disabled={index === 0}
                              value={email.send_delay_days ?? 0}
                              onChange={e => handleUpdate(index, 'send_delay_days', parseInt(e.target.value) || 0)}
                              style={{ width: 60, padding: '6px 10px', borderRadius: 7, border: '1.5px solid #D3D1C7', fontSize: 14, fontWeight: 700, textAlign: 'center' }}
                            />
                            <span style={{ fontSize: 12, color: '#888780' }}>{index === 0 ? 'days (immediate)' : 'days after signup'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${showToast ? '0' : '70px'})`,
        background: '#0e0e10', color: '#fff', padding: '10px 18px', borderRadius: 10,
        fontSize: 13, fontWeight: 500, zIndex: 300, transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
        display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,.2)',
      }}>
        <span style={{ color: '#4ade80' }}>✓</span> {toast}
      </div>

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div 
          className="fixed inset-0 bg-[#0e0e10]/60 backdrop-blur-md z-[400] flex items-center justify-center p-4"
          onClick={() => setShowIntegrationModal(false)}
        >
          <div 
            className="bg-white rounded-[24px] w-full max-w-[640px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-[modalSlideIn_0.3s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#04342C] p-8 md:p-10 text-white relative">
               <button 
                 onClick={() => setShowIntegrationModal(false)} 
                 className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">Sequence Active</h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed">
                  The final step is connecting your app&apos;s signup flow. When a user creates an account on your site, notify Sendrix to start their sequence.
                </p>
            </div>
            <div className="p-8 md:p-10 overflow-y-auto flex-1">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={16} className="text-[#0F6E56]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#888780]">WEBHOOK URL</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-[#F5F3EC] border-2 border-[#D3D1C7] rounded-xl px-4 py-3 text-sm font-mono break-all text-[#0e0e10]">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/${params.id}` : ''}
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/webhook/${params.id}`); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="sm:w-32 bg-[#04342C] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#04342C]/20 hover:bg-[#03261F] transition-all"
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
              <div className="border-t border-[#edeae2] pt-8 flex justify-center">
                 <button 
                   onClick={() => setShowIntegrationModal(false)} 
                   className="w-full sm:w-auto px-10 py-4 bg-[#E1F5EE] text-[#04342C] font-black rounded-xl hover:bg-[#D1EBE1] transition-colors"
                  >
                    Got it, thanks!
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
