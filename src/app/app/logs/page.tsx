'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import SendrixLoader from '@/components/SendrixLoader'
import { 
  History, MousePointer2, Search, RefreshCw, CheckCircle2, Clock, AlertCircle
} from 'lucide-react'

export default function ActivityLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadLogs = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch('/api/logs')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Failed to load logs', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }
      loadLogs()
      
      const interval = setInterval(() => loadLogs(true), 10000) // Poll every 10s for logs
      return () => clearInterval(interval)
    }
    checkSession()
  }, [])

  const filteredLogs = logs.filter(l => 
    l.subscribers.email.toLowerCase().includes(search.toLowerCase()) ||
    (l.subscribers.name || '').toLowerCase().includes(search.toLowerCase()) ||
    l.product_name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusComponent = (log: any) => {
    if (log.opened_at) return <span style={{ color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 4 }}><MousePointer2 size={12} /> Opened</span>
    if (log.sent_at) return <span style={{ color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Sent</span>
    if (log.status === 'failed') return <span style={{ color: '#D85A30', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> Failed</span>
    return <span style={{ color: '#888780', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {log.status}</span>
  }

  return (
    <div style={{ minHeight: '100%', background: '#F5F3EC', padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 32px) 80px' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
            History
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0e0e10] tracking-tight">
            Activity Logs
          </h1>
          <p className="text-sm text-[#5F5E5A] mt-1">A real-time feed of every email event across your workspaces.</p>
        </div>
        <button 
          onClick={() => loadLogs()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#D3D1C7] rounded-xl text-sm font-bold text-[#0e0e10] shadow-sm hover:border-[#04342C] transition-all disabled:opacity-50"
        >
          {loading ? <SendrixLoader variant="dots" size="sm" /> : <RefreshCw size={14} />}
          <span>{loading ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888780]" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by email or workspace..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#D3D1C7] bg-white text-sm focus:border-[#04342C] transition-all outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#D3D1C7] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-[#f5f3ec] bg-[#fafaf8]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Subscriber</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Workspace</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Email</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Event</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[#888780]">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <SendrixLoader label="Loading logs..." variant="dots" size="sm" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F3EC] flex items-center justify-center text-[#D3D1C7]">
                        <History size={24} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0e0e10]">No activity found</div>
                        <div className="text-xs text-[#888780]">Events will appear here as they happen.</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="border-b border-[#f5f3ec] hover:bg-[#F5F3EC]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0e0e10] truncate max-w-[200px]">
                        {log.subscribers?.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-[#888780] truncate max-w-[200px]">
                        {log.subscribers?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#0e0e10] uppercase tracking-tight">{log.product_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-[#5F5E5A]">Email #{log.email_number + 1}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-black">{getStatusComponent(log)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-[#888780]">
                        {new Date(log.sent_at || log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
