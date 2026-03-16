import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSupabaseUserId(email: string) {
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  return users.find(u => u.email === email)?.id || null
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = await getSupabaseUserId(session.user.email)
    if (!userId) return NextResponse.json({ logs: [] })

    // Get all products for this user
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .eq('user_id', userId)

    if (!products?.length) return NextResponse.json({ logs: [] })

    const productIds = products.map(p => p.id)

    // Fetch email logs join with subscribers
    const { data: logs, error } = await supabase
      .from('email_logs')
      .select(`
        *,
        subscribers!inner(
          id,
          email,
          name,
          product_id
        )
      `)
      .in('subscribers.product_id', productIds)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Map product names
    const productMap = Object.fromEntries(products.map(p => [p.id, p.name]))
    
    const enriched = logs.map(l => ({
      ...l,
      product_name: productMap[l.subscribers.product_id]
    }))

    return NextResponse.json({ logs: enriched })
  } catch (err: any) {
    console.error('GET /api/logs error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
