import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }

    console.log(`[Account Delete] Wiping data for user: ${userId}`)

    // 1. Fetch all product IDs to ensure we clean up related data specifically
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('user_id', userId)

    const productIds = products?.map(p => p.id) || []

    if (productIds.length > 0) {
      // 2. Delete email logs for all products
      await supabase
        .from('email_logs')
        .delete()
        .in('product_id', productIds)

      // 3. Delete subscribers for all products
      await supabase
        .from('subscribers')
        .delete()
        .in('product_id', productIds)

      // 4. Delete sequences for all products
      await supabase
        .from('sequences')
        .delete()
        .in('product_id', productIds)

      // 5. Delete products
      await supabase
        .from('products')
        .delete()
        .eq('user_id', userId)
    }

    // 6. Delete resend config
    await supabase
      .from('resend_config')
      .delete()
      .eq('user_id', userId)

    // 7. Delete public user profile
    await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    // 8. Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
      console.error('[Account Delete] Supabase Auth Error:', authError.message)
      // We continue even if auth delete fails, as database records are cleaned
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Account Delete] Fatal Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
