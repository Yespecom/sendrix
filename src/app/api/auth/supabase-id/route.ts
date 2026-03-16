import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Returns the real Supabase UUID for the currently logged-in user (looked up by email)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // List all users and find by email
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    })

    if (error) throw error

    const match = users.find((u) => u.email === session.user!.email)

    if (!match) {
      // User doesn't exist yet in Supabase Auth — create them
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: session.user.email,
        email_confirm: true,
        user_metadata: {
          full_name: session.user.name || '',
          avatar_url: (session.user as any).image || '',
        }
      })
      if (createError) throw createError
      return NextResponse.json({ id: newUser.user.id, email: newUser.user.email })
    }

    return NextResponse.json({ id: match.id, email: match.email })

  } catch (error: any) {
    console.error('supabase-id error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
