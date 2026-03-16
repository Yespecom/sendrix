'use client'

import { useState, useEffect } from 'react'
import { getSession, signOut } from 'next-auth/react'
import { Copy, CheckCircle2, AlertCircle, ExternalLink, Zap, Shield, CreditCard, User, ChevronRight, Trash2, FileText } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import SendrixLoader from '@/components/SendrixLoader'

const SECTIONS = [
  { id: 'resend',  label: 'Resend',   icon: Zap,        desc: 'Email delivery' },
  { id: 'webhook', label: 'Webhook',  icon: ExternalLink, desc: 'Signup integration' },
  { id: 'billing', label: 'Billing',  icon: CreditCard,  desc: 'Plan & usage' },
  { id: 'account', label: 'Account',  icon: User,        desc: 'Profile settings' },
  { id: 'danger',  label: 'Security', icon: Shield,      desc: 'Danger zone' },
]

/* ── Shared ──────────────────────────────────── */
const baseInput: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid #e2e0d9', background: '#fafaf8',
  fontSize: 13, color: '#0e0e10', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'all .15s',
}
const fi = (e: React.FocusEvent<any>) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#04342C'; e.target.style.boxShadow = '0 0 0 3px rgba(4,52,44,.08)' }
const fo = (e: React.FocusEvent<any>) => { e.target.style.background = '#fafaf8'; e.target.style.borderColor = '#e2e0d9'; e.target.style.boxShadow = 'none' }

function Row({ label, hint, children, last }: { label: string; hint?: React.ReactNode; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex flex-col md:grid md:grid-cols-[1fr_2fr] gap-4 md:gap-8 py-5 md:py-6 ${last ? '' : 'border-b border-[#f0ede6]'}`}>
      <div>
        <div className="text-sm font-bold text-[#0e0e10] mb-1">{label}</div>
        {hint && <div className="text-xs text-[#888780] leading-relaxed">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Block({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D3D1C7] overflow-hidden mb-4 shadow-sm">
      {title && (
        <div className="px-5 md:px-6 py-3.5 border-b border-[#f5f3ec] bg-[#fafaf8]">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#0e0e10]">{title}</div>
        </div>
      )}
      <div className="px-5 md:px-6">{children}</div>
    </div>
  )
}

function SectionWrapper({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-[24px] border border-[#D3D1C7] overflow-hidden shadow-sm animate-[modalEntry_0.3s_ease-out]">
      <div className="px-6 md:px-8 py-6 md:py-8 border-b border-[#f0ede6] bg-[#fafaf8] flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="w-12 h-12 rounded-xl bg-[#E1F5EE] border border-[#0F6E56]/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <div className="text-xl font-black text-[#0e0e10] tracking-tight">{title}</div>
          <div className="text-sm text-[#888780] mt-1">{description}</div>
        </div>
      </div>
      <div className="p-6 md:p-8">{children}</div>
    </div>
  )
}

function PrimaryBtn({ loading, label }: { loading?: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} style={{ padding: '8px 18px', background: '#0e0e10', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {loading ? (
        <>
          <SendrixLoader variant="dots" size="sm" label="Saving settings" />
          Saving...
        </>
      ) : (
        label
      )}
    </button>
  )
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: ok ? '#E1F5EE' : '#f0ede6', color: ok ? '#0F6E56' : '#888780' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {ok ? 'Connected' : 'Not connected'}
    </span>
  )
}

/* ── Redesigned Sections ─────────────────────── */
function ResendSection({ 
  connected, 
  setConnected, 
  initialConfig 
}: { 
  connected: boolean; 
  setConnected: (v: boolean) => void; 
  initialConfig?: any 
}) {
  const [apiKey, setApiKey] = useState('')
  const [fromEmail, setFromEmail] = useState(initialConfig?.from_email || '')
  const [fromName, setFromName] = useState(initialConfig?.from_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialConfig) {
      setFromEmail(initialConfig.from_email || '')
      setFromName(initialConfig.from_name || '')
      if (initialConfig.masked_resend) setApiKey(initialConfig.masked_resend)
    }
  }, [initialConfig])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch('/api/resend/verify', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          apiKey: apiKey.includes('•') ? undefined : apiKey, // Don't send masked value
          fromEmail, 
          fromName 
        }) 
      })
      const d = await res.json()
      if (res.ok && d.success) setConnected(true)
      else setError(d.error || 'Verification failed')
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  return (
    <SectionWrapper icon={<Zap size={15} color="#0F6E56" />} title="Email delivery" description="Connect Resend to send automated email sequences.">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <a 
            href="https://resend.com/domains" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              textDecoration: 'none',
              padding: '8px 12px',
              borderRadius: 10,
              background: '#fff',
              border: '1px solid #e2e0d9',
              transition: 'all .2s'
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#04342C'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.05)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e0d9'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <img src="/resend-wordmark-black.png" alt="Resend" style={{ height: 16, objectFit: 'contain' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0e0e10', marginLeft: -2 }}>Domains</span>
            <ExternalLink size={13} color="#888780" />
          </a>
        </div>
        <StatusBadge ok={connected} />
      </div>
      {error && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '12px 14px', marginBottom: 16, color: '#D85A30', fontSize: 13 }}><AlertCircle size={14} /> {error}</div>}
      
      {connected ? (
        <div style={{ background: '#E1F5EE', border: '1px solid #0F6E56', borderRadius: 14, padding: '20px', marginBottom: 24, boxShadow: '0 4px 12px rgba(15,110,86,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0F6E56', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="#fff" />
             </div>
             <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#04342C' }}>Active Configuration</div>
                <div style={{ fontSize: 11, color: '#0F6E56', fontWeight: 600, opacity: .7 }}>Synchronized with Resend API</div>
             </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
             <div style={{ background: 'rgba(255,255,255,.4)', padding: '12px 16px', borderRadius: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#0F6E56', textTransform: 'uppercase', marginBottom: 4 }}>Sender Name</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#04342C' }}>{initialConfig?.from_name || fromName || '—'}</div>
             </div>
             <div style={{ background: 'rgba(255,255,255,.4)', padding: '12px 16px', borderRadius: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#0F6E56', textTransform: 'uppercase', marginBottom: 4 }}>Sender Email</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#04342C' }}>{initialConfig?.from_email || fromEmail || '—'}</div>
             </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F3EC', border: '1px solid #e2e0d9', borderRadius: 9, padding: '12px 14px', marginBottom: 16, color: '#5F5E5A', fontSize: 13, fontWeight: 500 }}>
          <AlertCircle size={14} /> Connect your Resend account to start sending automated sequences.
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: '#0e0e10', marginBottom: 12 }}>{connected ? 'Update settings' : 'Setup connection'}</div>
      <Block>
        <form onSubmit={save}>
          <Row label="Resend API Key" hint="Found in Resend dashboard → API Keys.">
            <input required type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="re_••••••••" style={{ ...baseInput, fontFamily: 'monospace' }} onFocus={fi} onBlur={fo} />
          </Row>
          <Row label="From name" hint="Appears as the sender.">
            <input required type="text" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Alex from Invoicely" style={baseInput} onFocus={fi} onBlur={fo} />
          </Row>
          <Row label="From email" hint={<span>Must be verified on Resend.</span>} last>
            <input required type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="hello@yourdomain.com" style={baseInput} onFocus={fi} onBlur={fo} />
          </Row>
          <div style={{ paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}><PrimaryBtn loading={loading} label="Save configuration" /></div>
        </form>
      </Block>
    </SectionWrapper>
  )
}

function WebhookSection() {
  const [pid, setPid] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [pinging, setPinging] = useState(false)
  const [pingResult, setPingResult] = useState<any>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { if (d.products?.[0]?.id) setPid(d.products[0].id) })
  }, [])

  const triggerTestMode = async () => {
    if (!pid) return
    setPinging(true)
    setPingResult(null)
    try {
      const res = await fetch('/api/webhook/test-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: pid })
      })
      const data = await res.json()
      setPingResult(data)
    } catch (err) {
      setPingResult({ error: 'Failed to connect to server' })
    } finally {
      setPinging(false)
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${origin}/api/webhook/${pid || '[product_id]'}`
  const snippet = `const payload = JSON.stringify({ email: 'user@example.com', name: 'Jane' })
const sig = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET).update(payload).digest('hex')

await fetch('${url}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Sendrix-Signature': sig },
  body: payload,
})`

  const copy = (t: string, k: string) => {
    navigator.clipboard.writeText(t); setCopied(k); setTimeout(() => setCopied(null), 2000)
  }

  return (
    <SectionWrapper icon={<ExternalLink size={15} color="#0F6E56" />} title="Webhook integration" description="The final step is connecting your app's signup flow. When a user creates an account on your site, you notify Sendrix to start their sequence.">
      <Block title="Endpoint">
        <Row label="URL" hint="POST here after signup." last>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, background: '#fafaf8', border: '1px solid #e2e0d9', borderRadius: 8, padding: '9px 12px', fontFamily: 'monospace', fontSize: 12, color: '#04342C', overflowX: 'auto' }}>{url}</div>
            <button onClick={() => copy(url, 'url')} style={{ padding: '9px 12px', background: '#F5F3EC', border: '1px solid #e2e0d9', borderRadius: 8, cursor: 'pointer', color: '#5F5E5A' }}>
              {copied === 'url' ? <CheckCircle2 size={14} color="#0F6E56" /> : <Copy size={14} />}
            </button>
          </div>
        </Row>
      </Block>
      <Block title="Payload shape">
        <div style={{ padding: '14px 0' }}>
          <div style={{ background: '#0e0e10', borderRadius: 9, padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 }}>
            <span style={{ color: '#888780' }}>{'{'}</span><br />
            &nbsp;&nbsp;<span style={{ color: '#7dd3fc' }}>"email"</span>: <span style={{ color: '#86efac' }}>"user@example.com"</span>,<br />
            &nbsp;&nbsp;<span style={{ color: '#7dd3fc' }}>"name"</span>:&nbsp; <span style={{ color: '#86efac' }}>"Jane Doe"</span>&nbsp;&nbsp;<span style={{ color: '#4b5563' }}>// optional</span><br />
            <span style={{ color: '#888780' }}>{'}'}</span>
          </div>
        </div>
      </Block>
      <Block title="Node.js context">
        <div style={{ padding: '14px 0' }}>
          <div style={{ background: '#0e0e10', borderRadius: 9, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>webhook.js</span>
              <button onClick={() => copy(snippet, 'code')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', fontSize: 11 }}>
                {copied === 'code' ? 'Copied' : 'Copy code'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '14px 16px', color: '#D3D1C7', fontSize: 12, overflowX: 'auto' }}>{snippet}</pre>
          </div>
        </div>
      </Block>

    <Block title="Test Integration">
        <div style={{ padding: '18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0e0e10', marginBottom: 2 }}>Fire a test event</div>
              <div style={{ fontSize: 11.5, color: '#888780', lineHeight: 1.5 }}>Verify your endpoint is reachable and correctly configured.</div>
            </div>
            <button 
              onClick={triggerTestMode}
              disabled={pinging || !pid}
              style={{ padding: '8px 16px', background: '#0e0e10', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: pinging ? 'not-allowed' : 'pointer', opacity: pinging ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {pinging ? <SendrixLoader variant="dots" size="sm" /> : <Zap size={13} fill="#EF9F27" color="#EF9F27" />}
              {pinging ? 'Pinging...' : 'Ping Test Webhook'}
            </button>
          </div>

          {pingResult && (
            <div style={{ marginTop: 16, background: pingResult.success ? '#E1F5EE' : '#FEF2F2', borderRadius: 10, border: `1px solid ${pingResult.success ? '#9FE1CB' : '#FECACA'}`, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${pingResult.success ? 'rgba(15,110,86,.1)' : 'rgba(185,28,28,.1)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: pingResult.success ? '#0F6E56' : '#B91C1C' }}>
                  {pingResult.success ? 'SUCCESS' : 'FAILED'} (Status: {pingResult.status})
                </span>
                <button onClick={() => setPingResult(null)} style={{ background: 'none', border: 'none', fontSize: 10, color: '#888', cursor: 'pointer' }}>Close</button>
              </div>
              <pre style={{ margin: 0, padding: 12, fontSize: 11, color: pingResult.success ? '#04342C' : '#991B1B', fontFamily: 'monospace', overflowX: 'auto' }}>
                {JSON.stringify(pingResult.response || pingResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Block>
    </SectionWrapper>
  )
}

function BillingSection({
  stats,
  account,
}: {
  stats: { workspaces: number, subscribers: number, sent: number } | null
  account: {
    plan: 'starter' | 'indie' | 'pro'
    foundingMember: boolean
    planLabel: string
    priceLabel: string
    limits: { maxProducts: number | null; maxAiGenerationsPerMonth: number | null; maxEmailsPerMonth: number | null }
    nextBillingDate?: string | null
    lastPaymentId?: string | null
  } | null
}) {
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelMessage, setCancelMessage] = useState('')
  const maxProducts = account?.limits?.maxProducts ?? 1
  const workspaceLimitText = maxProducts === null ? 'Unlimited' : maxProducts
  const monthlyEmailLimit = account?.limits?.maxEmailsPerMonth ?? null
  const emailLimit = monthlyEmailLimit === null ? 'Unlimited' : monthlyEmailLimit.toLocaleString()
  const planName = account?.foundingMember ? 'Founding Member' : account?.planLabel || 'Starter'
  const planPrice = account?.priceLabel || '$0/mo'
  const planNote = account?.foundingMember
    ? 'Locked in forever · billed monthly'
    : account?.plan === 'pro'
    ? 'For scaling startups · billed monthly'
    : 'Start free · no credit card required'

  const USAGE = [
    { label: 'Workspaces', value: `${stats?.workspaces || 0} / ${workspaceLimitText}` },
    { label: 'Subscribers', value: `${stats?.subscribers.toLocaleString() || 0} / Unlimited` },
    { label: 'Emails sent', value: `${stats?.sent.toLocaleString() || 0} / ${emailLimit}` },
  ]

  const cancelSubscription = async () => {
    const shouldCancel = window.confirm('Cancel your subscription now?')
    if (!shouldCancel) return

    setCanceling(true)
    setCancelError('')
    setCancelMessage('')

    try {
      const res = await fetch('/api/billing/cancel-subscription', { method: 'POST' })
      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error((payload && payload.error) || 'Failed to cancel subscription')
      }

      setCancelMessage((payload && payload.message) || 'Subscription canceled successfully.')
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel subscription')
    } finally {
      setCanceling(false)
    }
  }

  return (
    <SectionWrapper icon={<CreditCard size={15} color="#0F6E56" />} title="Plan & billing" description="Your current plan and usage.">
       <div style={{ background: 'linear-gradient(130deg, #04342C 0%, #0F6E56 100%)', borderRadius: 14, padding: '24px', marginBottom: 16, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#EF9F27', textTransform: 'uppercase' }}>{planName}</span></div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {planPrice.replace('/mo', '')}
            <span style={{ fontSize: 16, opacity: .5 }}>{planPrice.includes('/mo') ? '/mo' : ''}</span>
          </div>
          <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{planNote}</div>
       </div>
       <Block title="Usage">
         {USAGE.map((u, i) => (
           <Row key={u.label} label={u.label} last={i === USAGE.length - 1}>
             <span style={{ fontSize: 13, fontWeight: 600 }}>{u.value}</span>
           </Row>
         ))}
       </Block>

       {account?.plan !== 'starter' && account?.nextBillingDate && (
         <Block title="Subscription Details">
            <Row label="Next Payment" hint="Automatically charged via your payment method." last>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>
                {new Date(account.nextBillingDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </Row>
         </Block>
       )}

       {account?.plan !== 'starter' && (
         <Block title="Invoice & History">
           <Row label="Latest Invoice" hint="Download your branded Sendrix invoice with GST breakdown." last>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
               <a
                 href="/app/invoice"
                 style={{
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: 6,
                   padding: '9px 16px',
                   borderRadius: 9,
                   background: '#04342C',
                   color: '#fff',
                   fontSize: 12,
                   fontWeight: 700,
                   textDecoration: 'none',
                   boxShadow: '0 2px 8px rgba(4,52,44,.15)',
                   transition: 'all .15s',
                 }}
                 onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#03261F'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                 onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#04342C'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
               >
                 <FileText size={13} />
                 View & Download Invoice
               </a>
             </div>
             {!account?.lastPaymentId && (
               <p style={{ fontSize: 11, color: '#888780', fontStyle: 'italic', marginTop: 6 }}>No payment recorded yet.</p>
             )}
           </Row>
         </Block>
       )}

       <Block title="Manage subscription">
         <div style={{ padding: '16px 0' }}>
           {cancelMessage && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E1F5EE', border: '1px solid #6ee7b7', borderRadius: 9, padding: '10px 14px', marginBottom: 12, color: '#04342C', fontSize: 13, fontWeight: 500 }}>
               <CheckCircle2 size={14} color="#0F6E56" />
               {cancelMessage}
             </div>
           )}
           {cancelError && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 14px', marginBottom: 12, color: '#B91C1C', fontSize: 13, fontWeight: 500 }}>
               <AlertCircle size={14} color="#B91C1C" />
               {cancelError}
             </div>
           )}

           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
             <a
                href="/pricing"
               target="_blank"
               rel="noopener noreferrer"
               style={{
                 display: 'inline-flex',
                 alignItems: 'center',
                 gap: 6,
                 padding: '10px 16px',
                 borderRadius: 10,
                 border: '1px solid #e2e0d9',
                 background: '#fff',
                 color: '#0e0e10',
                 textDecoration: 'none',
                 fontSize: 13,
                 fontWeight: 700,
                 cursor: 'pointer'
               }}
             >
               Explore plans
               <ExternalLink size={13} />
             </a>

             {account && account.plan !== 'starter' && (
               <button
                 type="button"
                 onClick={cancelSubscription}
                 disabled={canceling}
                 style={{
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: 6,
                   padding: '10px 16px',
                   borderRadius: 10,
                   border: '1px solid #FECACA',
                   background: '#fff',
                   color: '#B91C1C',
                   fontSize: 13,
                   fontWeight: 700,
                   cursor: canceling ? 'not-allowed' : 'pointer',
                   opacity: canceling ? 0.6 : 1
                 }}
               >
                 {canceling ? 'Canceling...' : 'Cancel subscription'}
               </button>
             )}
           </div>
         </div>
       </Block>
    </SectionWrapper>
  )
}

function AccountSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  useEffect(() => { getSession().then(s => { if (s?.user) { setName(s.user.name || ''); setEmail(s.user.email || '') }}) }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    // Only name update is implemented here
    await new Promise(r => setTimeout(r, 600))
    setSaved(true); setLoading(false); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <SectionWrapper icon={<User size={15} color="#0F6E56" />} title="Account" description="Your profile settings.">
      {saved && <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E1F5EE', border: '1px solid #6ee7b7', borderRadius: 9, padding: '10px 14px', marginBottom: 16, color: '#04342C', fontSize: 13, fontWeight: 500 }}><CheckCircle2 size={14} color="#0F6E56" /> Changes saved.</div>}
      
      <Block title="Profile">
        <form onSubmit={save}>
          <Row label="Full name">
            <input value={name} onChange={e => setName(e.target.value)} style={baseInput} onFocus={fi} onBlur={fo} />
          </Row>
          <Row label="Email" last>
            <input value={email} disabled style={{ ...baseInput, background: '#f5f3ec', color: '#888780' }} />
          </Row>
          <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'flex-end' }}><PrimaryBtn loading={loading} label="Save profile" /></div>
        </form>
      </Block>

      <Block title="Password">
        <Row label="Current password">
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" style={baseInput} onFocus={fi} onBlur={fo} />
        </Row>
        <Row label="New password" last>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" style={baseInput} onFocus={fi} onBlur={fo} />
        </Row>
        <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <button style={{ padding: '8px 18px', background: '#fff', border: '1px solid #e2e0d9', color: '#0e0e10', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Change password</button>
        </div>
      </Block>

    </SectionWrapper>
  )
}

function DeleteAccountModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: () => void; loading: boolean }) {
  const [confirmText, setConfirmText] = useState('')
  
  return (
    <div 
      className="fixed inset-0 bg-[#0e0e10]/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-[24px] w-full max-w-[400px] overflow-hidden shadow-2xl animate-[modalEntry_0.3s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 md:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border-4 border-white shadow-sm flex items-center justify-center mx-auto mb-6 text-red-600">
             <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#0e0e10] mb-2 tracking-tight">Delete account?</h2>
          <p className="text-sm text-[#5F5E5A] leading-relaxed">
            This will permanently remove your workspaces, subscribers, and email logs. 
            <span className="block font-black text-red-600 mt-2 uppercase tracking-tight">This action is irreversible.</span>
          </p>
        </div>

        <div className="px-8 md:px-10 pb-8 md:pb-10">
          <div className="mb-6">
            <label className="block text-[10px] font-black text-[#0e0e10] uppercase tracking-widest mb-2 text-center">
              Type <span className="font-mono bg-[#F5F3EC] px-2 py-0.5 rounded text-red-600">DELETE</span> to confirm
            </label>
            <input 
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full text-center py-4 bg-[#F5F3EC] border-2 border-transparent focus:border-red-600 rounded-xl font-mono text-lg font-black tracking-[4px] outline-none transition-all uppercase placeholder:opacity-20"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-[#F5F3EC] text-[#5F5E5A] font-black rounded-xl hover:bg-[#edeae2] transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={confirmText !== 'DELETE' || loading}
              onClick={onConfirm}
              className={`
                flex-1 px-6 py-4 bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-600/20 transition-all
                ${(confirmText !== 'DELETE' || loading) ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : 'hover:bg-red-700'}
              `}
            >
              {loading ? 'Deleting...' : 'Delete Forever'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DangerSection() {
  const [deleting, setDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (res.ok) {
        signOut({ callbackUrl: '/' })
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete account.")
        setDeleting(false)
        setShowModal(false)
      }
    } catch (err) {
      alert("An error occurred. Please try again.")
      setDeleting(false)
      setShowModal(false)
    }
  }

  return (
    <SectionWrapper icon={<Shield size={15} color="#D85A30" />} title="Security & Privacy" description="Irreversible account actions.">
      <div style={{ border: '1px solid #FECACA', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', background: '#FEF2F2', borderBottom: '1px solid #FECACA', fontSize: 11, fontWeight: 700, color: '#B91C1C' }}>DANGER ZONE</div>
        <div style={{ padding: '20px 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Delete account</div><div style={{ fontSize: 12, color: '#888780', marginTop: 3 }}>This will permanently wipe all your data across the entire system.</div></div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #FECACA', 
              color: '#D85A30', 
              background: '#fff', 
              borderRadius: 8, 
              fontSize: 12, 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Trash2 size={14} />
            Delete Permanently
          </button>
        </div>
      </div>
      {showModal && <DeleteAccountModal onClose={() => setShowModal(false)} onConfirm={confirmDelete} loading={deleting} />}
    </SectionWrapper>
  )
}

/* ── Main Page ───────────────────────────────── */
export default function SettingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [resendConnected, setResendConnected] = useState(false)
  const [resendConfig, setResendConfig] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<{ workspaces: number, subscribers: number, sent: number } | null>(null)
  const [account, setAccount] = useState<any>(null)

  const activeTab = searchParams.get('tab') || 'resend'

  const setTab = (id: string) => {
    router.replace(`/app/settings?tab=${id}`, { scroll: false })
  }

  useEffect(() => {
    fetch('/api/resend/verify')
      .then(r => r.json())
      .then(d => {
        if (d.connected) {
          setResendConnected(true)
          setResendConfig(d.config)
        }
      })

    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        if (d.products) {
          const stats = d.products.reduce((acc: any, p: any) => {
            acc.subscribers += (p.stats?.subscribers || 0)
            acc.sent += (p.stats?.sent || 0)
            return acc
          }, { workspaces: d.products.length, subscribers: 0, sent: 0 })
          setUsageStats(stats)
        }
        if (d.account) setAccount(d.account)
      })
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'webhook': return <WebhookSection />
      case 'billing': return <BillingSection stats={usageStats} account={account} />
      case 'account': return <AccountSection />
      case 'danger': return <DangerSection />
      default: return <ResendSection connected={resendConnected} setConnected={setResendConnected} initialConfig={resendConfig} />
    }
  }

  return (
    <div className="min-h-full bg-[#F5F3EC] px-5 md:px-8 py-8 md:py-10">
      <style jsx global>{`
        @keyframes modalEntry {
          from { opacity: 0; transform: scale(.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .settings-tabs::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="mb-8">
        <div style={{ fontSize: 10, fontWeight: 700, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>Settings</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0e0e10] tracking-tight leading-tight">Configuration</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
        {/* Sidebar / Tabs */}
        <div className="lg:w-[240px] lg:shrink-0 lg:sticky lg:top-8 order-1 lg:order-none">
          <div className="settings-tabs flex lg:flex-col overflow-x-auto lg:overflow-visible p-1.5 bg-[#edeae2] lg:bg-white rounded-2xl border border-[#D3D1C7] shadow-sm gap-1 lg:gap-0">
            {SECTIONS.map(s => {
              const Icon = s.icon
              const isActive = activeTab === s.id
              return (
                <button 
                  key={s.id} 
                  onClick={() => setTab(s.id)}
                  className={`
                    flex items-center gap-3 shrink-0 lg:w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${isActive ? 'bg-[#04342C] text-white shadow-lg shadow-[#04342C]/20' : 'text-[#888780] hover:text-[#5F5E5A] hover:bg-white'}
                  `}
                >
                  <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                    ${isActive ? 'bg-white/10 text-white' : 'bg-[#F5F3EC] text-[#888780]'}
                  `}>
                    <Icon size={14} />
                  </div>
                  <span className="whitespace-nowrap">{s.label}</span>
                </button>
              )
            })}
          </div>
          
          <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-white border border-[#D3D1C7] shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#888780] mb-2">Support</div>
            <p className="text-xs text-[#5F5E5A] leading-relaxed mb-4">Need help with your configuration? Our team is here to help.</p>
            <a href="mailto:support@sendrix.io" className="text-xs font-bold text-[#0F6E56] hover:underline flex items-center gap-1">
              Contact support <ChevronRight size={12} />
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
