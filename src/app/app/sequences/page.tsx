'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import SendrixLoader from '@/components/SendrixLoader'
import { 
  Sparkles, ChevronRight, Rocket, Receipt, CheckCircle2, BarChart3, 
  PenTool, Package, MessageSquare, Bell, Calendar, Lightbulb, 
  Wrench, Target, TrendingUp, DollarSign, Sprout, Zap, Users, Mail, MousePointer2 
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  'receipt': Receipt, 'check': CheckCircle2, 'chart': BarChart3, 'rocket': Rocket,
  'pen': PenTool, 'package': Package, 'message': MessageSquare, 'bell': Bell,
  'calendar': Calendar, 'idea': Lightbulb, 'tool': Wrench, 'target': Target,
  'trend': TrendingUp, 'money': DollarSign, 'leaf': Sprout, 'bolt': Zap,
}

const BG_COLORS: Record<string, string> = {
  'receipt': '#E1F5EE', 'check': '#EEF2FF', 'chart': '#E0F2FE', 'rocket': '#FEE2E2',
  'pen': '#FEF3C7', 'package': '#F3E8FF', 'message': '#E0F7FA', 'bell': '#FFF3E0',
  'calendar': '#E8F5E9', 'idea': '#FFFDE7', 'tool': '#ECEFF1', 'target': '#FCE4EC',
  'trend': '#E8F5E9', 'money': '#FFF8E1', 'leaf': '#F1F8E9', 'bolt': '#FFFDE7',
}

export default function SequencesIndexPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async (silent = false) => {
      if (!silent) setLoading(true)
      const session = await getSession()
      if (!session?.user) { if (!silent) router.push('/login'); return }

      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const { products } = await res.json()
          setProducts(products || [])
        }
      } catch (err) {
        console.error('Sequences refresh error:', err)
      }
      setLoading(false)
    }
    load()
    const interval = setInterval(() => load(true), 20000) // Silent refresh every 20s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SendrixLoader label="Loading sequences..." />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', background: '#F5F3EC', padding: '36px 32px 80px' }}>

      {/* Header */}
      <div className="mb-10 animate-[fadeUp_0.3s_ease-out]">
        <div style={{ fontSize: 10, fontWeight: 700, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>
          {products.length} sequence{products.length !== 1 ? 's' : ''}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0e0e10] tracking-tight">
          Email Sequences
        </h1>
        <p className="text-sm text-[#5F5E5A] mt-1 lg:max-w-2xl">Manage and optimize your automated onboarding journey for each product.</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-[#D3D1C7] p-10 md:p-16 text-center max-w-[480px] animate-[fadeUp_0.4s_ease-out]">
          <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-6 text-[#0F6E56] border border-[#0F6E56]/10">
            <Sparkles size={32} />
          </div>
          <h2 className="text-xl font-black text-[#0e0e10] mb-2">No sequences yet</h2>
          <p className="text-sm text-[#5F5E5A] mb-8">Create a workspace first, then generate your onboarding sequence.</p>
          <button
            onClick={() => router.push('/app/dashboard')}
            className="px-8 py-3.5 bg-[#04342C] text-white rounded-xl font-bold shadow-lg shadow-[#04342C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Go to dashboard →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-[fadeUp_0.45s_ease-out]">
          {products.map((p: any) => {
            const hasSequence = Array.isArray(p.sequences) && p.sequences.length > 0
            const seq = hasSequence ? p.sequences[0] : null
            const emailCount = seq?.emails?.length || 0
            const status = seq?.status || 'draft'
            const openRate = p.stats?.sent > 0 ? Math.round((p.stats?.opened / p.stats?.sent) * 100) : 0

            const statusStyle: Record<string, { bg: string; color: string; pulse: boolean }> = {
              active: { bg: '#E1F5EE', color: '#0F6E56', pulse: true },
              draft:  { bg: '#f0ede6', color: '#888780', pulse: false },
              paused: { bg: '#FAF0D8', color: '#BA7517', pulse: false },
            }
            const s = statusStyle[status] || statusStyle.draft
            const IconComp = ICON_MAP[p.brief?.emoji || ''] || Rocket
            const bgColor = BG_COLORS[p.brief?.emoji || ''] || '#E1F5EE'

            return (
              <div
                key={p.id}
                onClick={() => hasSequence ? router.push(`/app/sequences/${p.id}`) : router.push(`/workspace-setup/brief?productId=${p.id}`)}
                className="group relative bg-white rounded-2xl border border-[#D3D1C7] p-6 cursor-pointer hover:border-[#04342C] hover:shadow-xl hover:shadow-[#04342C]/5 transition-all"
              >
                <div className="flex items-start gap-5">
                  {/* Product Icon */}
                  <div 
                    style={{ background: bgColor }}
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-black/5"
                  >
                    <IconComp size={28} className="text-[#04342C]" />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="text-lg font-black text-[#0e0e10] truncate uppercase tracking-tight">{p.name}</div>
                      {status === 'active' && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-[10px] font-black uppercase">
                          <span className={`w-1 h-1 rounded-full bg-current ${s.pulse ? 'animate-pulse' : ''}`} />
                          Live
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#888780] mb-6">
                      {emailCount} {emailCount === 1 ? 'EMAIL' : 'EMAILS'} IN SEQUENCE
                    </div>

                    {/* Stats list */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-[#F5F3EC] border border-[#D3D1C7]/10">
                        <div className="text-[10px] font-black uppercase text-[#888780] mb-0.5">Users</div>
                        <div className="text-sm font-black text-[#0e0e10]">{p.stats?.subscribers || 0}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F5F3EC] border border-[#D3D1C7]/10">
                        <div className="text-[10px] font-black uppercase text-[#888780] mb-0.5">Sent</div>
                        <div className="text-sm font-black text-[#0e0e10]">{p.stats?.sent || 0}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#F5F3EC] border border-[#D3D1C7]/10">
                        <div className="text-[10px] font-black uppercase text-[#888780] mb-0.5">Open</div>
                        <div className="text-sm font-black text-[#0e0e10]">{openRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <ChevronRight size={20} className="text-[#04342C]" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style jsx global>{`
        .seq-card:hover { border-color: #04342C !important; box-shadow: 0 8px 20px rgba(4,52,44,.06) !important; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: .4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
