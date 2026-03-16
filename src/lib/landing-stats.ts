import 'server-only'
import { createClient } from '@supabase/supabase-js'

export type LandingStats = {
  claimedSpots: number
  totalSpots: number
  claimedPercentage: number
  founderInitials: string[]
}

const TOTAL_SPOTS = 100
const FALLBACK_INITIALS = ['JD', 'AS', 'MK', 'LR', 'ST']

type UserLite = {
  full_name: string | null
  email: string | null
}

function initialsFromUser(user: UserLite): string | null {
  const name = (user.full_name || '').trim()
  if (name) {
    const letters = name
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    if (letters) return letters
  }

  const email = (user.email || '').trim()
  if (!email) return null
  const localPart = email.split('@')[0] || ''
  const cleaned = localPart.replace(/[^a-zA-Z0-9]/g, '')
  if (!cleaned) return null
  return cleaned.slice(0, 2).toUpperCase()
}

export async function getLandingStats(): Promise<LandingStats> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return {
      claimedSpots: 0,
      totalSpots: TOTAL_SPOTS,
      claimedPercentage: 0,
      founderInitials: FALLBACK_INITIALS,
    }
  }

  const supabase = createClient(url, key)

  const [{ count: foundingCount }, { count: totalUsersCount }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('founding_member', true),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  const useFoundingMembers = (foundingCount || 0) > 0
  const rawClaimed = useFoundingMembers ? foundingCount || 0 : totalUsersCount || 0
  const claimedSpots = Math.min(rawClaimed, TOTAL_SPOTS)
  const claimedPercentage = Math.min(100, Math.max(0, Math.round((claimedSpots / TOTAL_SPOTS) * 100)))

  let users: UserLite[] = []
  let query = supabase.from('users').select('full_name, email').limit(5)
  if (useFoundingMembers) query = query.eq('founding_member', true)

  const { data: orderedUsers } = await query.order('created_at', { ascending: false })
  if (orderedUsers?.length) {
    users = orderedUsers
  } else {
    const { data: fallbackUsers } = await query
    users = fallbackUsers || []
  }

  const initials = users.map(initialsFromUser).filter((value): value is string => Boolean(value))
  const founderInitials = [...initials, ...FALLBACK_INITIALS].slice(0, 5)

  return {
    claimedSpots,
    totalSpots: TOTAL_SPOTS,
    claimedPercentage,
    founderInitials,
  }
}
