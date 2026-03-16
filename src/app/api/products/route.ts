import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'
import { PLAN_CONFIG, getPlanLabel, normalizePlan } from '@/lib/plans'

// Service role bypasses RLS — safe because we do auth checks manually
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/products — list current user's products
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = user.id

    // Ensure row in public.users
    await supabase.from('users').upsert(
      { id: userId, email: user.email },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const { data: dbUser } = await supabase
      .from('users')
      .select('plan, founding_member, next_billing_date, last_payment_id')
      .eq('id', userId)
      .single()

    const plan = normalizePlan(dbUser?.plan)
    const foundingMember = !!dbUser?.founding_member
    const planConfig = PLAN_CONFIG[plan]

    const { data: products, error } = await supabase
      .from('products')
      .select('*, sequences(id, status, emails)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Fetch stats for each product
    const productsWithStats = await Promise.all((products || []).map(async (p) => {
      // Get subscriber count
      const { count: subscribersCount } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', p.id)

      // Get sent email count (join with subscribers)
      const { count: sentCount } = await supabase
        .from('email_logs')
        .select('id, subscribers!inner(product_id)', { count: 'exact', head: true })
        .eq('subscribers.product_id', p.id)
        .eq('status', 'sent')

      // Get opened email count
      // We assume opened_at column exists. If it doesn't, we'll fall back to 0.
      const { count: openedCount } = await supabase
        .from('email_logs')
        .select('id, subscribers!inner(product_id)', { count: 'exact', head: true })
        .eq('subscribers.product_id', p.id)
        .not('opened_at', 'is', null)

      return {
        ...p,
        stats: {
          subscribers: subscribersCount || 0,
          sent: sentCount || 0,
          opened: openedCount || 0
        }
      }
    }))

    return NextResponse.json({
      products: productsWithStats,
      userId,
      account: {
        plan,
        foundingMember,
        planLabel: getPlanLabel(plan, foundingMember),
        priceLabel: planConfig.priceLabel,
        nextBillingDate: dbUser?.next_billing_date,
        lastPaymentId: dbUser?.last_payment_id,
        limits: {
          maxProducts: planConfig.maxProducts,
          maxAiGenerationsPerMonth: planConfig.maxAiGenerationsPerMonth,
          maxEmailsPerMonth: planConfig.maxEmailsPerMonth,
        },
      },
    })
  } catch (err: any) {
    console.error('GET /api/products error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/products — create a new product
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, emoji } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const userId = user.id
    
    // Ensure row in public.users
    await supabase.from('users').upsert(
      { id: userId, email: user.email, full_name: user.name || '' },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const { data: dbUser } = await supabase
      .from('users')
      .select('plan, founding_member, next_billing_date, last_payment_id')
      .eq('id', userId)
      .single()

    const plan = normalizePlan(dbUser?.plan)
    const foundingMember = !!dbUser?.founding_member
    const planConfig = PLAN_CONFIG[plan]

    if (planConfig.maxProducts !== null) {
      const { count: productsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      if ((productsCount || 0) >= planConfig.maxProducts) {
        return NextResponse.json(
          {
            error: `${getPlanLabel(plan, foundingMember)} plan supports up to ${planConfig.maxProducts} workspace${planConfig.maxProducts === 1 ? '' : 's'}. Upgrade to Pro for unlimited workspaces.`,
            code: 'PLAN_LIMIT_REACHED',
            limitType: 'workspaces',
            plan,
            maxProducts: planConfig.maxProducts,
          },
          { status: 403 }
        )
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name: name.trim(),
        brief: { emoji: emoji || 'Rocket', product_name: name.trim() }
      })
      .select('id')
      .single()

    if (error) throw error

    // Trigger onboarding interaction via webhook
    try {
      const { triggerOnboardingWebhook } = await import('@/lib/webhook-notify')
      triggerOnboardingWebhook(user.email, user.name || 'Founder')
    } catch (err) {
      console.error('Failed to trigger onboarding interaction:', err)
    }

    return NextResponse.json({
      product: data,
      account: {
        plan,
        foundingMember,
        planLabel: getPlanLabel(plan, foundingMember),
        priceLabel: planConfig.priceLabel,
        nextBillingDate: dbUser?.next_billing_date,
        lastPaymentId: dbUser?.last_payment_id,
        limits: {
          maxProducts: planConfig.maxProducts,
          maxAiGenerationsPerMonth: planConfig.maxAiGenerationsPerMonth,
          maxEmailsPerMonth: planConfig.maxEmailsPerMonth,
        },
      },
    })
  } catch (err: any) {
    console.error('POST /api/products error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
