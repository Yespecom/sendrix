import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { createClient } from '@supabase/supabase-js'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PLAN_CONFIG, getPlanLabel, normalizePlan, resolveSignupPlanSelection } from '@/lib/plans'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function accountPayload(planRaw: string | null | undefined, foundingMember: boolean) {
  const plan = normalizePlan(planRaw)
  const config = PLAN_CONFIG[plan]
  return {
    plan,
    foundingMember,
    planLabel: getPlanLabel(plan, foundingMember),
    priceLabel: config.priceLabel,
    limits: {
      maxProducts: config.maxProducts,
      maxAiGenerationsPerMonth: config.maxAiGenerationsPerMonth,
      maxEmailsPerMonth: config.maxEmailsPerMonth,
    },
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase.from('users').upsert(
      { id: user.id, email: user.email, full_name: user.name || '' },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    const { data: dbUser } = await supabase
      .from('users')
      .select('plan, founding_member, email, full_name, next_billing_date, last_payment_id, last_payment_at')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user: {
        email: dbUser?.email,
        name: dbUser?.full_name,
      },
      account: {
        ...accountPayload(dbUser?.plan, !!dbUser?.founding_member),
        nextBillingDate: dbUser?.next_billing_date,
        lastPaymentId: dbUser?.last_payment_id,
        lastPaymentAt: dbUser?.last_payment_at,
      }
    })
  } catch (err: any) {
    console.error('GET /api/user/plan error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { selectedPlan, fullName, email } = await req.json().catch(() => ({}))
    const resolved = resolveSignupPlanSelection(selectedPlan)

    const { error } = await supabase.from('users').upsert(
      {
        id: user.id,
        email: email || user.email,
        full_name: fullName || user.name || '',
        plan: resolved.plan,
        founding_member: resolved.foundingMember,
      },
      { onConflict: 'id' }
    )

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      account: accountPayload(resolved.plan, resolved.foundingMember),
    })
  } catch (err: any) {
    console.error('POST /api/user/plan error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
