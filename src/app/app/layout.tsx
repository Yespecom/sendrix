'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { 
  Receipt, CheckCircle2, BarChart3, Rocket, PenTool, Package, MessageSquare, 
  Bell, Calendar, Lightbulb, Wrench, Target, TrendingUp, DollarSign, Sprout, Zap,
  Star, LayoutDashboard, ListOrdered, Users2, Settings2, LogOut, Plus, ChevronRight, ChevronDown, 
  ExternalLink, CreditCard, History, Book
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  'receipt': Receipt, 'check': CheckCircle2, 'chart': BarChart3, 'rocket': Rocket,
  'pen': PenTool, 'package': Package, 'message': MessageSquare, 'bell': Bell,
  'calendar': Calendar, 'idea': Lightbulb, 'tool': Wrench, 'target': Target,
  'trend': TrendingUp, 'money': DollarSign, 'leaf': Sprout, 'bolt': Zap,
}

const Icons = {
  workspaces:  <LayoutDashboard size={14} />,
  sequences:   <ListOrdered size={14} />,
  subscribers: <Users2 size={14} />,
  logs:        <History size={14} />,
  docs:        <Book size={14} />,
  settings:    <Settings2 size={14} />,
  resend:      <Zap size={13} />,
  webhook:     <ExternalLink size={13} />,
  billing:     <CreditCard size={13} />,
  logout:      <LogOut size={14} />,
  plus:        <Plus size={11} />,
  chevron:     <ChevronRight size={12} />,
  chevronDown: <ChevronDown size={10} />,
}

function NavItem({ href, icon, label, badge, active, small }: { href: string; icon: React.ReactNode; label: string; badge?: string | number; active: boolean; small?: boolean }) {
  return (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: small ? 7 : 9, padding: small ? '6px 8px' : '7px 9px', borderRadius: 7, cursor: 'pointer', textDecoration: 'none', marginBottom: 1, background: active ? 'rgba(255,255,255,.12)' : 'transparent', transition: 'background .14s' }} className="sb-item">
      <div style={{ width: small ? 22 : 26, height: small ? 22 : 26, borderRadius: small ? 5 : 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.07)', color: active ? '#fff' : 'rgba(255,255,255,.4)' }}>
        {icon}
      </div>
      <span style={{ fontSize: small ? 12 : 13, fontWeight: 500, color: active ? '#fff' : 'rgba(255,255,255,.55)', flex: 1, letterSpacing: '-.1px' }}>{label}</span>
      {badge !== undefined && <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.1)', color: active ? '#fff' : 'rgba(255,255,255,.45)', borderRadius: 20, padding: '2px 7px', minWidth: 20, textAlign: 'center' }}>{badge}</span>}
    </Link>
  )
}

function Divider() { return <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '4px 6px' }} /> }
function Label({ text }: { text: string }) { return <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.22)', textTransform: 'uppercase', letterSpacing: '.1em', padding: '10px 9px 4px' }}>{text}</div> }

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParamsObj = useSearchParams()
  const searchTab = searchParamsObj.get('tab') || ''
  const { data: session } = useSession()
  const user = session?.user as any

  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [subCount, setSubCount] = useState<number | null>(null)
  const [account, setAccount] = useState<any>(null)
  const [settingsOpen, setSettingsOpen] = useState(
    ['/app/resend', '/app/webhook', '/app/billing', '/app/settings'].some(p => pathname.startsWith(p))
  )
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Auto-open settings if on a settings sub-page
  useEffect(() => {
    if (['/app/resend', '/app/webhook', '/app/billing', '/app/settings'].some(p => pathname.startsWith(p))) {
      setSettingsOpen(true)
    }
  }, [pathname])

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, subRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/subscribers')
        ])
        
        if (prodRes.ok) {
          const d = await prodRes.json()
          if (d.products) setWorkspaces(d.products)
          if (d.account) setAccount(d.account)
        }
        
        if (subRes.ok) {
          const d = await subRes.json()
          if (d.total !== undefined) setSubCount(d.total)
        }
      } catch (err) {
        console.error('Sidebar refresh error:', err)
      }
    }

    load()
    const interval = setInterval(load, 15000) // Refresh sidebar every 15s
    return () => clearInterval(interval)
  }, [])

  const showToastMsg = (msg: string) => {
    clearTimeout(toastTimer.current); setToast(msg); setShowToast(true)
    toastTimer.current = setTimeout(() => setShowToast(false), 2600)
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'
  const sidebarPlanTitle = account?.foundingMember
    ? 'Founding Member · Indie'
    : `${account?.planLabel || 'Starter'} plan`
  const sidebarPlanSubtext = account?.priceLabel
    ? `${account.priceLabel}${account?.limits?.maxProducts === null ? ' · unlimited workspaces' : ` · ${account?.limits?.maxProducts || 1} workspace${(account?.limits?.maxProducts || 1) === 1 ? '' : 's'}`}`
    : '$0/mo · 1 workspace'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Close mobile menu on navigate
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const active = (href: string, exact = false) => exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: '#E8E6E0', overflow: 'hidden', flexShrink: 0, display: 'inline-flex' }}>
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <defs>
              <clipPath id="sidebarLogoClip">
                <rect width="32" height="32" rx="9" />
              </clipPath>
            </defs>
            <rect width="32" height="32" rx="9" fill="#E8E6E0" />
            <polygon points="6,26 6,6 28,16" fill="#04342C" clipPath="url(#sidebarLogoClip)" />
            <polygon points="6,6 28,16 6,16" fill="#085041" clipPath="url(#sidebarLogoClip)" />
            <polygon points="6,26 16,16 6,21" fill="#EF9F27" clipPath="url(#sidebarLogoClip)" />
            <polygon points="6,26 6,18 12,16" fill="#E8E6E0" clipPath="url(#sidebarLogoClip)" />
          </svg>
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,.94)', letterSpacing: '-0.3px' }}>
          Sendrix<span style={{ color: '#EF9F27' }}>.</span>
        </span>
      </div>

      {/* Plan badge */}
      <div style={{ margin: '8px 10px 4px', background: 'rgba(239,159,39,.13)', border: '1px solid rgba(239,159,39,.22)', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <Star size={12} color="#EF9F27" fill="#EF9F27" />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#EF9F27', letterSpacing: '.04em' }}>{sidebarPlanTitle}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>{sidebarPlanSubtext}</div>
        </div>
      </div>

      {/* ── Scrollable top nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '2px 6px', scrollbarWidth: 'none' }}>
        <Label text="Main" />
        <NavItem href="/app/dashboard"   icon={Icons.workspaces}  label="Workspaces"  active={active('/app/dashboard', true)} badge={workspaces.length || undefined} />
        <NavItem href="/app/sequences"   icon={Icons.sequences}   label="Sequences"   active={active('/app/sequences')} />
        <NavItem href="/app/subscribers" icon={Icons.subscribers} label="Subscribers" active={active('/app/subscribers')} badge={subCount !== null ? subCount : undefined} />
        <NavItem href="/app/logs"        icon={Icons.logs}        label="Activity Logs" active={active('/app/logs')} />

        <Divider />
        <Label text="Workspaces" />

        {workspaces.length === 0
          ? <div style={{ fontSize: 11, color: 'rgba(255,255,255,.22)', padding: '3px 9px 8px', fontStyle: 'italic' }}>No workspaces yet</div>
          : workspaces.slice(0, 5).map(ws => {
              const seqStatus = ws.sequences?.[0]?.status
              const dot = seqStatus === 'active' ? '#1D9E75' : seqStatus === 'paused' ? '#EF9F27' : 'rgba(255,255,255,.18)'
              const isWsActive = pathname.includes(ws.id)
              const RawIcon = ICON_MAP[ws.brief?.emoji || ''] || Rocket
              return (
                <div key={ws.id} onClick={() => router.push(`/app/sequences/${ws.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', borderRadius: 7, cursor: 'pointer', marginBottom: 1, background: isWsActive ? 'rgba(255,255,255,.1)' : 'transparent', transition: 'background .14s' }}
                  className="sb-item"
                >
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isWsActive ? '#fff' : 'rgba(255,255,255,.4)' }}>
                    <RawIcon size={12} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: isWsActive ? '#fff' : 'rgba(255,255,255,.5)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                </div>
              )
            })
        }

        <div onClick={() => router.push('/app/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px', borderRadius: 7, cursor: 'pointer', marginBottom: 1, opacity: .45, transition: 'opacity .14s' }}
          className="sb-add-hover"
        >
          <div style={{ width: 20, height: 20, borderRadius: 5, border: '1px dashed rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)', flexShrink: 0 }}>{Icons.plus}</div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>Add workspace</span>
        </div>
      </nav>

      {/* ── Bottom section: Settings + Profile ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '6px 6px 2px', flexShrink: 0 }}>
        <NavItem href="/app/settings" icon={Icons.settings} label="Settings" active={pathname.startsWith('/app/settings')} />
        
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', borderRadius: 7, cursor: 'pointer', width: '100%', background: 'transparent', border: 'none', marginBottom: 4, transition: 'background .14s', fontFamily: 'inherit' }}
          className="sb-item"
        >
          <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.35)' }}>{Icons.logout}</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.45)', textAlign: 'left' }}>Log out</span>
        </button>

        <div
          onClick={() => router.push('/app/settings')}
          style={{ padding: '9px 10px', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderRadius: 8, transition: 'background .14s', marginBottom: 2 }}
          className="sb-item"
        >
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,.3), rgba(255,255,255,.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Account'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
          <div style={{ color: 'rgba(255,255,255,.2)', flexShrink: 0 }}>{Icons.chevron}</div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-[#F5F3EC]" style={{ fontFamily: "Poppins, system-ui, sans-serif" }}>



      {/* ═══ MOBILE HEADER ═══ */}
      <div className="md:hidden flex h-16 items-center justify-between px-5 bg-[#04342C] border-b border-white/10 shrink-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#E8E6E0] overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <polygon points="6,26 6,6 28,16" fill="#04342C" />
              <polygon points="6,6 28,16 6,16" fill="#085041" />
              <polygon points="6,26 16,16 6,21" fill="#EF9F27" />
            </svg>
          </span>
          <span className="text-white font-bold tracking-tight">Sendrix</span>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/70 hover:text-white"
        >
          {mobileMenuOpen ? <Plus style={{ transform: 'rotate(45deg)' }} size={24} /> : (
            <div className="flex flex-col gap-1.5 w-6">
              <div className="h-0.5 w-full bg-current rounded-full" />
              <div className="h-0.5 w-full bg-current rounded-full" />
              <div className="h-0.5 w-full bg-current rounded-full" />
            </div>
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        


        {/* ═══ SIDEBAR (Responsive) ═══ */}
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm shadow-2xl"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside className={`
          fixed md:relative z-[110] md:z-auto h-full w-[232px] flex-shrink-0 bg-[#04342C] flex flex-col transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <SidebarContent />
        </aside>

        {/* ═══ MAIN ═══ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 22, left: '50%',
        transform: `translateX(-50%) translateY(${showToast ? '0' : '60px'})`,
        background: '#0e0e10', color: '#fff', padding: '10px 16px', borderRadius: 9,
        fontSize: 13, fontWeight: 500, zIndex: 300, transition: 'transform .26s cubic-bezier(.4,0,.2,1)',
        display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,.25)',
      }}>
        <span style={{ color: '#4ade80' }}>✓</span><span>{toast}</span>
      </div>

      <style>{`
        .sb-item:hover { background: rgba(255,255,255,.07) !important; }
        .sb-add-hover:hover { opacity: 0.75 !important; }
        nav::-webkit-scrollbar { display: none; }
      `}</style>
      </div>
    </div>
  )
}
