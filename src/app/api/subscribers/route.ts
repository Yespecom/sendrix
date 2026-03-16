import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSupabaseUserId(email: string) {
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  return users.find(u => u.email === email)?.id || null
}

// GET /api/subscribers — all subscribers across all products
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = await getSupabaseUserId(session.user.email)
    if (!userId) return NextResponse.json({ subscribers: [], total: 0 })

    // Get all products for this user
    const { data: products } = await supabase
      .from('products')
      .select('id, name, brief')
      .eq('user_id', userId)

    if (!products?.length) return NextResponse.json({ subscribers: [], total: 0 })

    const productIds = products.map(p => p.id)
    const productMap = Object.fromEntries(products.map(p => [p.id, p]))

    // Get all subscribers for those products with email log counts
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select(`
        *,
        email_logs(id, status, email_number, sent_at)
      `)
      .in('product_id', productIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    const enriched = (subscribers || []).map(s => ({
      ...s,
      product: productMap[s.product_id],
      emails_sent: s.email_logs?.filter((l: any) => l.status === 'sent').length || 0,
      emails_total: s.email_logs?.length || 0,
    }))

    return NextResponse.json({
      subscribers: enriched,
      total: enriched.length,
      active: enriched.filter(s => s.status === 'active' || s.status === 'enrolled').length,
      unsubscribed: enriched.filter(s => s.status === 'unsubscribed').length,
    })
  } catch (err: any) {
    console.error('GET /api/subscribers error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
