import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Check if caller owns the product
async function verifyOwner(productId: string, userId: string): Promise<boolean> {
  const { data: product } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', productId)
    .single()

  return product?.user_id === userId
}

// GET /api/products/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: product, error } = await supabase
      .from('products')
      .select('*, sequences(*)')
      .eq('id', params.id)
      .eq('user_id', (session.user as any).id)
      .maybeSingle()

    if (error || !product) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/products/[id] — update brief
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await verifyOwner(params.id, (session.user as any).id)
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const updateObj: any = {}
    if (body.name) updateObj.name = body.name
    if (body.emoji) updateObj.emoji = body.emoji
    if (body.brief) updateObj.brief = body.brief

    const { error } = await supabase.from('products').update(updateObj).eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/products/[id] — delete workspace + cascade
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isOwner = await verifyOwner(params.id, (session.user as any).id)
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Cascade delete (FK constraints may handle this, but be explicit)
    await supabase.from('email_logs').delete().eq('product_id', params.id)
    await supabase.from('subscribers').delete().eq('product_id', params.id)
    await supabase.from('sequences').delete().eq('product_id', params.id)
    const { error } = await supabase.from('products').delete().eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/products/[id] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
