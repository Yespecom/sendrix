'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import SendrixLoader from '@/components/SendrixLoader'
import { 
  Receipt, CheckCircle2, BarChart3, Rocket, PenTool, Package, MessageSquare, 
  Bell, Calendar, Lightbulb, Wrench, Target, TrendingUp, DollarSign, Sprout, Zap,
  Trash2, ExternalLink, MoreVertical, Plus, Lock, Users, MousePointer2, Mail
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  'receipt': Receipt, 'check': CheckCircle2, 'chart': BarChart3, 'rocket': Rocket,
  'pen': PenTool, 'package': Package, 'message': MessageSquare, 'bell': Bell,
  'calendar': Calendar, 'idea': Lightbulb, 'tool': Wrench, 'target': Target,
  'trend': TrendingUp, 'money': DollarSign, 'leaf': Sprout, 'bolt': Zap,
}

const ICONS = Object.keys(ICON_MAP)

const BG_COLORS: Record<string, string> = {
  'receipt': '#E1F5EE', 'check': '#EEF2FF', 'chart': '#E0F2FE', 'rocket': '#FEE2E2',
  'pen': '#FEF3C7', 'package': '#F3E8FF', 'message': '#E0F7FA', 'bell': '#FFF3E0',
  'calendar': '#E8F5E9', 'idea': '#FFFDE7', 'tool': '#ECEFF1', 'target': '#FCE4EC',
  'trend': '#E8F5E9', 'money': '#FFF8E1', 'leaf': '#F1F8E9', 'bolt': '#FFFDE7',
}

type Workspace = {
  id: string
  name: string
  emoji: string
  description: string
  subscribers: number
  emailsSent: number
  emailsOpened: number
  status: 'active' | 'draft' | 'paused'
}

type AccountSummary = {
  plan: 'starter' | 'indie' | 'pro'
  foundingMember: boolean
  planLabel: string
  priceLabel: string
  limits: {
    maxProducts: number | null
    maxAiGenerationsPerMonth: number | null
    maxEmailsPerMonth: number | null
  }
}

export default function DashboardPage() {
  const router = useRouter()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [account, setAccount] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [resendConnected, setResendConnected] = useState<boolean>(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(ICONS[3]) // rocket
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null)
  const [deleting, setDeleting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const inputRef = useRef<HTMLInputElement>(null)
  const workspaceLimit = account?.limits?.maxProducts ?? null
  const workspaceLimitReached = workspaceLimit !== null && workspaces.length >= workspaceLimit
  const planLabel = account?.planLabel || 'Starter'
  const lockMessage =
    workspaceLimit === null
      ? ''
      : `${planLabel} plan supports up to ${workspaceLimit} workspace${workspaceLimit === 1 ? '' : 's'}. Upgrade to Pro for unlimited workspaces.`
  const monthlyEmailQuota = account?.limits?.maxEmailsPerMonth
  const aiGenerationQuota = account?.limits?.maxAiGenerationsPerMonth
  const aiGenerationsUsed = Math.min(1, aiGenerationQuota ?? 3)
  const aiUsageLabel =
    aiGenerationQuota === null || aiGenerationQuota === undefined
      ? 'AI usage 1/∞'
      : `AI usage ${aiGenerationsUsed}/${aiGenerationQuota}`

  const showToastMsg = (msg: string) => {
    clearTimeout(timerRef.current)
    setToast(msg)
    setShowToast(true)
    timerRef.current = setTimeout(() => setShowToast(false), 2600)
  }

  useEffect(() => {
    const load = async (silent = false) => {
      if (!silent) setLoading(true)
      const session = await getSession()
      if (!session?.user) { if (!silent) router.push('/login'); return }

      // Use server-side API route (service role key bypasses RLS)
      try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const { products, account: accountInfo } = await res.json()
        if (accountInfo) setAccount(accountInfo)
        if (products) {
          setWorkspaces(
            products.map((p: any) => ({
                id: p.id,
                name: p.name,
                emoji: p.brief?.emoji || 'rocket',
                description: p.brief?.description || 'SaaS onboarding sequence',
                subscribers: p.stats?.subscribers || 0,
                emailsSent: p.stats?.sent || 0,
                emailsOpened: p.stats?.opened || 0,
                status: (Array.isArray(p.sequences) && p.sequences.some((s: any) => s.status === 'active')) ? 'active' : 'draft',
              }))
            )
          }
        }
      } catch (err) {
        console.error('Refresh error:', err)
      }
      setLoading(false)
    }

    load()
    const interval = setInterval(() => load(true), 15000) // Silent refresh every 15s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let cancelled = false
    const checkResendConnection = async () => {
      try {
        const res = await fetch('/api/resend/verify')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setResendConnected(!!data.connected)
      } catch (err) {
        console.error('Resend connection check failed:', err)
      }
    }

    checkResendConnection()
    const interval = setInterval(checkResendConnection, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (modalOpen) setTimeout(() => inputRef.current?.focus(), 120)
  }, [modalOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (workspaceLimitReached) {
          showToastMsg(lockMessage)
          return
        }
        setModalOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeModal, lockMessage, showToastMsg, workspaceLimitReached])

  function closeModal() {
    setModalOpen(false)
    setNewName('')
    setSelectedIcon(ICONS[3])
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)

    // Use server-side API — service role key so RLS doesn't block
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), emoji: selectedIcon }),
    })

    const json = await res.json()
    setCreating(false)

    if (!res.ok) {
      if (json.account) setAccount(json.account)
      console.error('Create workspace error:', json.error)
      if (res.status === 403 && json.code === 'PLAN_LIMIT_REACHED') {
        showToastMsg(json.error || lockMessage)
      } else {
        showToastMsg(`Error: ${json.error}`)
      }
    } else {
      if (json.account) setAccount(json.account)
      // Use the workspace-setup flow for new workspaces after onboarding
      router.push(`/workspace-setup/brief?productId=${json.product.id}`)
    }
  }

  const openWorkspace = (ws: Workspace) => {
    router.push(`/app/sequences/${ws.id}`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      setWorkspaces(prev => prev.filter((w: any) => w.id !== deleteTarget.id))
      setDeleteTarget(null)
      showToastMsg(`"${deleteTarget.name}" deleted`)
    } else {
      const data = await res.json()
      showToastMsg(`Error: ${data.error}`)
      setDeleteTarget(null)
    }
  }

  return (
    <div style={{ minHeight: '100%', background: '#F5F3EC', padding: '0 0 60px' }}>

      {/* Page Content */}
      <div style={{ padding: 'clamp(20px, 4vw, 36px) clamp(16px, 3vw, 32px)' }}>

        {/* Header */}
        <div
          style={{ marginBottom: 30, animation: 'fadeUp .38s ease both' }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div style={{ fontSize: 10, fontWeight: 700, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
                {loading ? '...' : `${workspaces.length} workspaces · ${planLabel} plan`}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0e0e10] tracking-tight leading-[1.1]">
                Your workspaces
              </h1>
              <p className="text-sm md:text-base text-[#5F5E5A] mt-2 max-w-xl leading-relaxed">
                Each workspace is one SaaS product with its own sequence and subscribers.
                {workspaceLimit === null
                  ? ' Your Pro plan includes unlimited workspaces.'
                  : ` Your current limit is ${workspaceLimit} workspace${workspaceLimit === 1 ? '' : 's'}.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] md:text-[11px] font-bold letter-spacing-[0.2em] uppercase text-[#0F6E56] px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/20">
                {aiUsageLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SendrixLoader label="Loading workspaces..." />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {workspaces.map((ws: any) => (
              <WorkspaceCard key={ws.id} ws={ws} onClick={() => openWorkspace(ws)} onDelete={() => setDeleteTarget(ws)} />
            ))}

            {/* Add card */}
            <AddCard
              onClick={() => setModalOpen(true)}
              locked={workspaceLimitReached}
              lockMessage={lockMessage}
              onLocked={() => router.push('/workspace-setup/select-plans')}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        className="fixed inset-0 bg-[#0e0e10]/40 backdrop-blur-sm z-[200] flex items-center justify-center px-4 transition-opacity duration-200"
        style={{ opacity: modalOpen ? 1 : 0, pointerEvents: modalOpen ? 'all' : 'none' }}
      >
        <div 
          className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[440px] shadow-2xl transition-transform duration-200"
          style={{ transform: modalOpen ? 'scale(1)' : 'scale(.95)' }}
        >
          <div style={{ fontFamily: "Poppins, system-ui, sans-serif", fontSize: 22, color: '#0e0e10', fontWeight: 400, marginBottom: 4 }}>New workspace</div>
          <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 20 }}>Name your SaaS and pick an icon to get started.</div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#0e0e10', marginBottom: 5, display: 'block' }}>Product name</label>
            <input
              ref={inputRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newName.trim().length >= 2) handleCreate() }}
              placeholder="e.g. Invoicely, TaskFlow…"
              style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${newName ? '#04342C' : '#D3D1C7'}`, borderRadius: 8, fontSize: 14, color: '#0e0e10', background: '#F5F3EC', fontFamily: 'inherit', outline: 'none', transition: 'border-color .14s', boxShadow: newName ? '0 0 0 3px rgba(4,52,44,.08)' : 'none' }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#0e0e10', marginBottom: 5, display: 'block' }}>Icon</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginTop: 6 }}>
              {ICONS.map(ic => {
                const IconComp = ICON_MAP[ic]
                const active = selectedIcon === ic
                return (
                  <button
                    key={ic}
                    onClick={() => setSelectedIcon(ic)}
                    style={{
                      width: 32, height: 32, borderRadius: 6, background: active ? '#E1F5EE' : '#f0ede6',
                      border: `1.5px solid ${active ? '#0F6E56' : 'transparent'}`,
                      cursor: 'pointer', transition: 'all .12s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#0F6E56' : '#888780'
                    }}
                  >
                    <IconComp size={16} />
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={closeModal} style={{ flex: 1, padding: 10, border: '1.5px solid #D3D1C7', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#5F5E5A', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={newName.trim().length < 2 || creating || workspaceLimitReached}
              style={{ flex: 2, padding: 10, background: '#04342C', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', cursor: newName.trim().length < 2 || workspaceLimitReached ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(4,52,44,.2)', opacity: newName.trim().length < 2 || creating || workspaceLimitReached ? 0.35 : 1, transition: 'opacity .14s' }}
            >
              {creating ? 'Creating...' : workspaceLimitReached ? 'Limit reached' : 'Create workspace →'}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      <div
        onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
        className="fixed inset-0 bg-[#0e0e10]/50 backdrop-blur-sm z-[300] flex items-center justify-center px-4 transition-opacity duration-200"
        style={{ opacity: deleteTarget ? 1 : 0, pointerEvents: deleteTarget ? 'all' : 'none' }}
      >
        <div 
          className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-[400px] shadow-2xl transition-transform duration-200"
          style={{ transform: deleteTarget ? 'scale(1)' : 'scale(.95)' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 11, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Trash2 size={20} color="#D85A30" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0e0e10', marginBottom: 6 }}>Delete workspace?</div>
          <div style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 24, lineHeight: 1.6 }}>
            <strong style={{ color: '#0e0e10' }}>{deleteTarget?.name}</strong> and all its sequences, subscribers, and email logs will be permanently deleted. This cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{ flex: 1, padding: '10px 0', border: '1.5px solid #D3D1C7', borderRadius: 9, fontSize: 14, fontWeight: 600, color: '#5F5E5A', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ flex: 1.4, padding: '10px 0', background: '#D85A30', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 22, left: '50%',
        transform: `translateX(-50%) translateY(${showToast ? '0' : '60px'})`,
        background: '#0e0e10', color: '#fff', padding: '10px 16px', borderRadius: 8,
        fontSize: 13, fontWeight: 500, zIndex: 300, transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
        display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,.2)',
      }}>
        <span style={{ color: '#4ade80' }}>✓</span>
        <span>{toast}</span>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .wc-card:hover .wc-line { transform: scaleX(1) !important; }
        .wc-card:hover .wc-dots { opacity: 1 !important; }
        .wc-card:hover .wc-open-txt { opacity: 1 !important; }
        .ac-card:hover { border-color: #04342C !important; background: #fff !important; }
        .ac-card:hover .ac-plus { background: #04342C !important; color: #fff !important; }
        .ac-card:hover .ac-lbl { color: #04342C !important; }
        .menu-hover:hover { background: #F5F3EC !important; }
        .menu-hover-danger:hover { background: #FEF2F2 !important; }
      `}</style>

    </div>
  )
}

function WorkspaceCard({ ws, onClick, onDelete }: { ws: Workspace; onClick: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const statusMap = {
    active: { label: 'Live', bg: '#E1F5EE', color: '#0F6E56', pulse: true },
    draft: { label: 'Draft', bg: '#f0ede6', color: '#888780', pulse: false },
    paused: { label: 'Paused', bg: '#BA7517', color: '#BA7517', pulse: false },
  }
  const s = (statusMap as any)[ws.status] || statusMap.draft
  const IconComp = ICON_MAP[ws.emoji] || Rocket
  const bgColor = BG_COLORS[ws.emoji] || '#E1F5EE'

  const openRate = ws.emailsSent > 0 
    ? Math.round((ws.emailsOpened / ws.emailsSent) * 100) 
    : 0

  return (
    <div
      onClick={onClick}
      className="wc-card"
      style={{ background: '#fff', border: '1px solid #D3D1C7', borderRadius: 15, padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top accent line */}
      <div className="wc-line" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: '#04342C', transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform .24s cubic-bezier(.4,0,.2,1)' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F6E56' }}>
          <IconComp size={18} />
        </div>
        <div style={{ position: 'relative' }}>
          <div
            className="wc-dots"
            onClick={e => { e.stopPropagation(); setMenuOpen(m => !m) }}
            style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: menuOpen ? 1 : 0, cursor: 'pointer', color: '#5F5E5A', border: '1px solid transparent', transition: 'opacity .14s', background: menuOpen ? '#f0ede6' : 'transparent' }}
          >
            <MoreVertical size={14} />
          </div>
          {menuOpen && (
            <>
              <div onClick={e => { e.stopPropagation(); setMenuOpen(false) }} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
              <div style={{ position: 'absolute', top: 30, right: 0, background: '#fff', border: '1px solid #D3D1C7', borderRadius: 10, boxShadow: '0 8px 24px rgba(4,52,44,.12)', zIndex: 20, minWidth: 160, overflow: 'hidden' }}>
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onClick() }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#0e0e10', textAlign: 'left', fontFamily: 'inherit' }}
                  className="menu-hover"
                >
                  <ExternalLink size={14} />
                  Open sequence
                </button>
                <div style={{ height: 1, background: '#edeae2' }} />
                <button
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete() }}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#D85A30', textAlign: 'left', fontFamily: 'inherit' }}
                  className="menu-hover-danger"
                >
                  <Trash2 size={14} />
                  Delete workspace
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: '#0e0e10', letterSpacing: '-.3px', marginBottom: 4 }}>{ws.name}</div>
      <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.55, marginBottom: 16, flex: 1 }}>{ws.description}</div>

      {/* Stats */}
      <div style={{ display: 'flex', borderTop: '1px solid #edeae2', borderBottom: '1px solid #edeae2', marginBottom: 14 }}>
        {[
          { icon: <Users size={12} />, val: ws.subscribers || '0', lbl: 'Subs' },
          { icon: <MousePointer2 size={12} />, val: `${openRate}%`, lbl: 'Open' },
          { icon: <Mail size={12} />, val: ws.emailsSent || '0', lbl: 'Sent' },
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 2, borderRight: i < 2 ? '1px solid #edeae2' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px' }}>
              <span style={{ color: '#888780' }}>{stat.icon}</span>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0e0e10', letterSpacing: '-.3px' }}>{stat.val}</div>
            </div>
            <div style={{ fontSize: 9, color: '#888780', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 8px' }}>{stat.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {ws.status !== 'draft' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 20, padding: '0 8px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', animation: s.pulse ? 'pulse 2s ease infinite' : 'none' }}></span>
                {s.label}
              </span>
            )}
        <span className="wc-open-txt" style={{ fontSize: 12, fontWeight: 600, color: '#0F6E56', opacity: 0, transition: 'opacity .14s' }}>Open →</span>
      </div>
    </div>
  )
}

function AddCard({ onClick, locked, onLocked, lockMessage }: { onClick: () => void; locked: boolean; onLocked: () => void; lockMessage: string }) {
  return (
    <div
      onClick={locked ? onLocked : onClick}
      className="ac-card"
      style={{ border: '1.5px dashed #D3D1C7', borderRadius: 15, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 196, cursor: 'pointer', transition: 'all .2s', background: 'transparent' }}
    >
      <div className="ac-plus" style={{ width: 38, height: 38, borderRadius: 9, background: '#eae7df', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888780', transition: 'all .2s' }}>
        <Plus size={18} />
      </div>
      <div className="ac-lbl" style={{ fontSize: 13, fontWeight: 600, color: '#888780', transition: 'color .2s' }}>New workspace</div>
      <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', maxWidth: 210, lineHeight: 1.5 }}>
        {locked ? lockMessage : 'Click to create a new product'}
      </div>
      {locked && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#BA7517', background: '#FAF0D8', border: '1px solid #f0d090', borderRadius: 20, padding: '3px 9px' }}>
          <Lock size={9} />
          Upgrade required
        </div>
      )}
    </div>
  )
}
