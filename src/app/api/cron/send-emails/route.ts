import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import { PLAN_CONFIG, Plan, normalizePlan } from '@/lib/plans'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake-key'
)

const userQuotaCache: Record<string, {
  plan: Plan
  maxEmailsPerMonth: number | null
  monthlySent: number
  productIds: string[]
}> = {}

function getMonthBounds(date = new Date()) {
  const startOfMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0))
  const startOfNextMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0))
  return {
    start: startOfMonth.toISOString(),
    next: startOfNextMonth.toISOString(),
  }
}

async function ensureUserQuota(userId: string) {
  if (userQuotaCache[userId]) {
    return userQuotaCache[userId]
  }

  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = normalizePlan(user?.plan)
  const config = PLAN_CONFIG[plan]

  const { data: userProducts } = await supabase
    .from('products')
    .select('id')
    .eq('user_id', userId)

  const productIds = (userProducts || []).map(p => p.id)
  let monthlySent = 0

  if (config.maxEmailsPerMonth !== null && productIds.length > 0) {
    const { start } = getMonthBounds()
    const { count } = await supabase
      .from('email_logs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('sent_at', start)
      .in('subscribers.product_id', productIds)

    monthlySent = count || 0
  }

  const quota = {
    plan,
    maxEmailsPerMonth: config.maxEmailsPerMonth,
    monthlySent,
    productIds,
  }

  userQuotaCache[userId] = quota
  return quota
}

function decryptApiKey(encryptedKeyStr: string) {
  const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || process.env.WEBHOOK_HMAC_SECRET || 'fallback-32-byte-key-that-is-bad!'
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const { iv, encrypted, authTag } = JSON.parse(encryptedKeyStr)
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'))
  decipher.setAuthTag(Buffer.from(authTag, 'hex'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date().toISOString()

    const { data: pendingLogs, error: logError } = await supabase
      .from('email_logs')
      .select('*, subscribers(email, name, product_id, status)')
      .eq('status', 'pending')
      .lte('scheduled_at', now)

    if (logError) throw logError
    if (!pendingLogs || pendingLogs.length === 0) {
      return NextResponse.json({ message: 'No emails to send' })
    }

    let sentCount = 0

    for (const log of pendingLogs) {
      const sub = log.subscribers as any
      if (sub.status !== 'enrolled' && sub.status !== 'active') {
        continue 
      }

      const { data: product } = await supabase.from('products').select('user_id').eq('id', sub.product_id).single()
      if (!product) continue

      const { data: resendConfig } = await supabase.from('resend_config').select('*').eq('user_id', product.user_id).single()
      if (!resendConfig) continue

      const { data: sequence } = await supabase.from('sequences').select('emails').eq('product_id', sub.product_id).single()
      if (!sequence || !sequence.emails) continue

      const userQuota = await ensureUserQuota(product.user_id)
      if (userQuota.maxEmailsPerMonth !== null && userQuota.monthlySent >= userQuota.maxEmailsPerMonth) {
        const { next } = getMonthBounds()
        await supabase
          .from('email_logs')
          .update({ scheduled_at: next })
          .eq('id', log.id)
        continue
      }

      const emailData = sequence.emails[log.email_number]
      if (!emailData) continue

      try {
        const apiKey = decryptApiKey(resendConfig.api_key)
        const resend = new Resend(apiKey)
        
        await resend.emails.send({
          from: `${resendConfig.from_name} <${resendConfig.from_email}>`,
          to: sub.email,
          subject: emailData.subject,
          text: `${emailData.body}\n\n--\nUnsubscribe: https://sendrix.in/unsubscribe?token=${log.subscriber_id}`,
        })

        await supabase
          .from('email_logs')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', log.id)
        
        sentCount++
        userQuota.monthlySent += 1
      } catch (err: any) {
        console.error('Failed to send email:', err)
        const attempts = (log.attempts || 0) + 1
        let newStatus = 'pending'
        let newScheduled = new Date()

        if (attempts >= 3) {
          newStatus = 'failed'
        } else {
          newScheduled.setMinutes(newScheduled.getMinutes() + 15)
        }

        await supabase
          .from('email_logs')
          .update({ 
            status: newStatus, 
            attempts, 
            scheduled_at: newScheduled.toISOString() 
          })
          .eq('id', log.id)
      }
    }

    return NextResponse.json({ success: true, sent: sentCount })
  } catch (error: any) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
