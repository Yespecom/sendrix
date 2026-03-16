'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import SendrixLoader from '@/components/SendrixLoader'
import { 
  Users, CheckCircle2, Slash, Sparkles, Search, Download, 
  Receipt, BarChart3, Rocket, PenTool, Package, MessageSquare, 
  Bell, Calendar, Lightbulb, Wrench, Target, TrendingUp, DollarSign, Sprout, Zap
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  'receipt': Receipt, 'check': CheckCircle2, 'chart': BarChart3, 'rocket': Rocket,
  'pen': PenTool, 'package': Package, 'message': MessageSquare, 'bell': Bell,
  'calendar': Calendar, 'idea': Lightbulb, 'tool': Wrench, 'target': Target,
  'trend': TrendingUp, 'money': DollarSign, 'leaf': Sprout, 'bolt': Zap,
}

const STATUS_META: Record<string, { label: string; bg: string; color: string; pulse: boolean }> = {
  enrolled:     { label: 'Enrolled',     bg: '#E1F5EE', color: '#0F6E56', pulse: true },
  active:       { label: 'Active',       bg: '#E1F5EE', color: '#0F6E56', pulse: true },
  unsubscribed: { label: 'Unsubscribed', bg: '#FEE2E2', color: '#D85A30', pulse: false },
  bounced:      { label: 'Bounced',      bg: '#FEF3C7', color: '#B45309', pulse: false },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function EmailProgress({ sent, total }: { sent: number; total: number }) {
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 64, height: 4, background: '#edeae2', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#0F6E56', borderRadius: 99, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#888780', whiteSpace: 'nowrap' }}>
        {sent}/{total}
      </span>
    </div>
  )
}

export default function SubscribersPage() {
  const router = useRouter()

  const [subs, setSubs] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all')
  const [filterProduct, setFilterProduct] = useState<string>('all')
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [subsRes, prodsRes] = await Promise.all([
        fetch('/api/subscribers'),
        fetch('/api/products')
      ])
      
      if (subsRes.ok && prodsRes.ok) {
        const subsData = await subsRes.json()
        const prodsData = await prodsRes.json()
        const subscriberList: any[] = subsData.subscribers || []
        setSubs(subscriberList)
        // Use API-provided stats, or derive from the list as a fallback
        setStats(subsData.stats ?? {
          total: subscriberList.length,
          active: subscriberList.filter((s: any) => s.status === 'active' || s.status === 'enrolled').length,
          unsubscribed: subscriberList.filter((s: any) => s.status === 'unsubscribed').length,
        })
        setProducts(prodsData.products || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = subs.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || s.status === filter
    const matchesProduct = filterProduct === 'all' || s.product_id === filterProduct
    return matchesSearch && matchesFilter && matchesProduct
  })

  // Export as CSV
  const exportData = () => {
    const headers = ['Email', 'Name', 'Product', 'Status', 'Date Joined', 'Emails Sent']
    const rows = filtered.map(s => [
      s.email,
      s.name || '',
      s.product_name || '',
      s.status,
      new Date(s.created_at).toLocaleString(),
      s.emails_sent
    ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sendrix-subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100%', background: '#F5F3EC', padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)' }}>
      <style jsx global>{`
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: .6; transform: scale(.9); } 100% { opacity: 1; transform: scale(1); } }
        /* Mobile styles for subscribers page */
        @media (max-width: 767px) {
           .subscriber-filters > div, .subscriber-filters > select, .subscriber-filters > button { width: 100% !important; flex: none !important; }
           .status-filter { justify-content: space-between !important; }
           .status-filter button { flex: 1 !important; text-align: center !important; }
           .subscriber-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>Audience Management</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0e0e10] tracking-tight">Subscribers</h1>
        </div>
        {!loading && (
          <button 
            onClick={exportData}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#D3D1C7] rounded-xl text-sm font-bold text-[#0e0e10] shadow-sm hover:border-[#04342C] transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total subscribers', val: stats.total.toLocaleString(), icon: <Users size={18} />, color: '#0F6E56', bg: '#E1F5EE' },
          { label: 'Active now', val: stats.active.toLocaleString(), icon: <Sparkles size={18} />, color: '#106D9E', bg: '#E0F2FE' },
          { label: 'Unsubscribed', val: stats.unsubscribed.toLocaleString(), icon: <Slash size={18} />, color: '#D85A30', bg: '#FEE2E2' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[#D3D1C7] flex items-center gap-4 shadow-sm">
            <div 
              style={{ background: s.bg, color: s.color }}
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              {s.icon}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#888780] mb-0.5">{s.label}</div>
              <div className="text-xl font-black text-[#0e0e10]">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888780]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#D3D1C7] bg-white text-sm focus:border-[#04342C] transition-all outline-none"
            />
          </div>

          {/* Product filter */}
          <select 
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[#D3D1C7] bg-white text-sm font-bold text-[#0e0e10] focus:border-[#04342C] transition-all outline-none"
          >
            <option value="all">All products</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Tab-style status filter */}
        <div className="inline-flex p-1.5 bg-[#edeae2] rounded-xl border border-[#D3D1C7]">
          {(['all', 'active', 'unsubscribed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all
                ${filter === f ? 'bg-white text-[#0e0e10] shadow-md' : 'text-[#888780] hover:text-[#5F5E5A]'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-2xl border border-[#D3D1C7] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-[#f5f3ec] bg-[#fafaf8]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Subscriber</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Sequencing</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <SendrixLoader label="Loading subscribers..." variant="dots" size="sm" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F3EC] flex items-center justify-center text-[#D3D1C7]">
                        <Users size={24} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0e0e10]">No subscribers found</div>
                        <div className="text-xs text-[#888780]">Try adjusting your filters or search.</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s: any) => {
                  const meta = STATUS_META[s.status] || STATUS_META.active
                  const ProductIcon = ICON_MAP[s.product_emoji] || Rocket
                  return (
                    <tr key={s.id} className="border-b border-[#f5f3ec] hover:bg-[#F5F3EC]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            style={{ background: `hsl(${(s.email.length * 123) % 360}, 60%, 94%)`, color: `hsl(${(s.email.length * 123) % 360}, 60%, 30%)` }}
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                          >
                            {(s.name || s.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-[#0e0e10] truncate max-w-[200px]">{s.email}</div>
                            {s.name && <div className="text-xs text-[#888780] truncate max-w-[200px]">{s.name}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#F5F3EC] flex items-center justify-center text-[#0F6E56]">
                            <ProductIcon size={12} />
                          </div>
                          <span className="text-xs font-bold text-[#5F5E5A] truncate max-w-[150px]">{s.product_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span style={{ background: meta.bg, color: meta.color }} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          <span className={`w-1 h-1 rounded-full bg-current ${meta.pulse ? 'animate-pulse' : ''}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-[#888780]">{timeAgo(s.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <EmailProgress sent={s.emails_sent} total={s.emails_total} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#f5f3ec] flex justify-end">
            <span className="text-xs font-black text-[#888780] uppercase tracking-wider">
              Showing {filtered.length} of {subs.length} subscribers
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
