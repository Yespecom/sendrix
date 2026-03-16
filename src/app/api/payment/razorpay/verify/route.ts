import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      planKey,
      billingCycle 
    } = await req.json();

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Payment verified, update user plan
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    // Convert founding/indie to indie for DB consistency if needed
    const dbPlan = (planKey === 'founding' || planKey === 'indie') ? 'indie' : planKey;
    const isFounding = planKey === 'founding' || planKey === 'indie';

    // Calculate next payment date
    const nextDate = new Date();
    if (billingCycle === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        plan: dbPlan,
        founding_member: isFounding,
        next_billing_date: nextDate.toISOString(),
        last_payment_id: razorpay_payment_id,
        last_payment_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
        console.error('Database update error:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      account: {
        plan: dbPlan,
        foundingMember: isFounding,
        nextBillingDate: nextDate.toISOString(),
        lastPaymentId: razorpay_payment_id
      }
    });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
