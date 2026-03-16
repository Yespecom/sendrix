import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { razorpay } from '@/lib/razorpay';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PLAN_CONFIG, normalizePlan, resolveSignupPlanSelection } from '@/lib/plans';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planKey, billingCycle } = await req.json();
    const resolved = resolveSignupPlanSelection(planKey);
    const targetPlan = resolved.plan;

    // Fetch current plan and last payment date
    const { data: dbUser } = await supabase
      .from('users')
      .select('plan, last_payment_at')
      .eq('id', user.id)
      .single();

    const currentPlan = normalizePlan(dbUser?.plan);
    const lastPaymentAt = dbUser?.last_payment_at ? new Date(dbUser.last_payment_at) : null;
    const now = new Date();
    
    // 10-day logic
    const isWithin10Days = lastPaymentAt && (now.getTime() - lastPaymentAt.getTime()) <= 10 * 24 * 60 * 60 * 1000;

    const targetPrice = PLAN_CONFIG[targetPlan].priceInr;
    const currentPrice = PLAN_CONFIG[currentPlan].priceInr;

    let amount = targetPrice;

    // If upgrading and within 10 days, subtract current plan price
    if (targetPrice > currentPrice && isWithin10Days) {
      amount = Math.max(0, targetPrice - currentPrice);
    }

    // Handle yearly pricing if applicable
    if (billingCycle === 'yearly') {
      if (targetPlan === 'pro') {
        const yearlyTarget = 2399 * 12;
        amount = yearlyTarget;
        if (isWithin10Days) {
            amount = Math.max(0, yearlyTarget - currentPrice);
        }
      } else if (targetPlan === 'indie') {
        const yearlyTarget = 799 * 12;
        amount = yearlyTarget;
        if (isWithin10Days) {
            amount = Math.max(0, yearlyTarget - currentPrice);
        }
      }
    }

    // Razorpay minimum amount is often 1 INR (100 paise)
    if (amount <= 0 && targetPrice > 0) {
      amount = 1; // Symbolic 1 INR
    }
    
    // Razorpay expect amount in paise
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        planKey,
        billingCycle,
        prorated: isWithin10Days ? 'true' : 'false'
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
