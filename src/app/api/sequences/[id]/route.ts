import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/sequences/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    
    // Verify ownership (using session.user.id or searching for user by email)
    const { data: user } = await supabase.from('users').select('id').eq('email', session.user.email).single()
    if (product.user_id !== user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: sequence } = await supabase
      .from('sequences')
      .select('*')
      .eq('product_id', params.id)
      .maybeSingle()

    const { data: resendConfig } = await supabase
      .from('resend_config')
      .select('id, from_email, from_name')
      .eq('user_id', product.user_id)
      .maybeSingle()

    return NextResponse.json({ sequence, product, resendConnected: !!resendConfig })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/sequences/[id] — save emails
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { emails, status, design_key } = await req.json()

    const updateData: any = {}
    if (emails !== undefined) updateData.emails = emails
    if (status !== undefined) updateData.status = status
    if (design_key !== undefined) updateData.design_key = design_key

    const { error } = await supabase
      .from('sequences')
      .update(updateData)
      .eq('product_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
