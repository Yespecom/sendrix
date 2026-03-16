import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { normalizePlan, getPlanLabel, PLAN_CONFIG } from '@/lib/plans'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: dbUser, error } = await supabase
      .from('users')
      .select('plan, founding_member, email, full_name, next_billing_date, last_payment_id, last_payment_at, created_at')
      .eq('id', user.id)
      .single()

    if (error) throw error

    const plan = normalizePlan(dbUser?.plan)
    const foundingMember = !!dbUser?.founding_member
    const planConfig = PLAN_CONFIG[plan]
    const planLabel = getPlanLabel(plan, foundingMember)

    // Determine the subscription period
    const paymentAt = dbUser?.last_payment_at ? new Date(dbUser.last_payment_at) : null
    const nextBilling = dbUser?.next_billing_date ? new Date(dbUser.next_billing_date) : null

    // Price logic — same prices as rest of app
    const priceInr = planConfig.priceInr ?? 0
    const cgst = Math.round(priceInr * 0.09 * 100) / 100
    const sgst = Math.round(priceInr * 0.09 * 100) / 100
    const total = priceInr + cgst + sgst

    // Generate invoice number based on payment date
    const invoiceDate = paymentAt || new Date()
    const invoiceNum = `INV-${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}${String(invoiceDate.getDate()).padStart(2, '0')}`

    return NextResponse.json({
      invoice: {
        number: invoiceNum,
        date: invoiceDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        dueDate: nextBilling
          ? nextBilling.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          : null,
        status: plan !== 'starter' ? 'PAID' : 'FREE',
        period: paymentAt && nextBilling
          ? `${paymentAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} – ${nextBilling.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
          : null,
      },
      customer: {
        name: dbUser?.full_name || user.name || 'Customer',
        email: dbUser?.email || user.email || '',
      },
      plan: {
        key: plan,
        label: planLabel,
        foundingMember,
        billingCycle: 'Monthly',
        description: plan === 'indie'
          ? 'Monthly subscription — 3 workspaces, 20 AI generations/month, Resend integration & analytics'
          : plan === 'pro'
          ? 'Monthly subscription — unlimited workspaces, unlimited AI generations, A/B testing, agency delivery'
          : 'Free plan — 1 workspace, 3 AI generations/month',
      },
      pricing: {
        subtotal: priceInr,
        cgst,
        sgst,
        total,
        amountPaid: total,
        balanceDue: 0,
        currency: 'INR',
      },
      payment: {
        method: 'Card / UPI',
        transactionId: dbUser?.last_payment_id || null,
        date: paymentAt
          ? paymentAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
          : null,
      },
    })
  } catch (err: any) {
    console.error('GET /api/invoice error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
