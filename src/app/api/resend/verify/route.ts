import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    const body = await req.json()
    const { apiKey, aiccApiKey, fromEmail, fromName } = body

    if (!apiKey || !fromEmail || !fromName) {
      return NextResponse.json({ error: 'Resend API Key and From details are required' }, { status: 400 })
    }

    // Test Resend Verification
    const resend = new Resend(apiKey)
    try {
      await resend.domains.list()
    } catch (e: any) {
      return NextResponse.json({ success: false, error: 'Invalid Resend API Key' }, { status: 400 })
    }

    // Encrypt both keys as a JSON object
    const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'fallback-32-byte-key-that-is-bad!'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    const payload = JSON.stringify({ resend: apiKey, aicc: aiccApiKey || '' })
    let encrypted = cipher.update(payload, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag().toString('hex')
    
    const encryptedKey = JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag
    })

    const { error: dbError } = await supabase.from('resend_config').upsert({
      user_id: user.id,
      api_key: encryptedKey,
      from_email: fromEmail,
      from_name: fromName
    }, { onConflict: 'user_id' })

    if (dbError) throw new Error(dbError.message)

    // Trigger onboarding interaction via webhook
    try {
      const { triggerOnboardingWebhook } = await import('@/lib/webhook-notify')
      triggerOnboardingWebhook(user.email, user.name || 'Founder')
    } catch (err) {
      console.error('Failed to trigger onboarding interaction:', err)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Resend verify error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('resend_config')
      .select('id, api_key, from_email, from_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!data) return NextResponse.json({ connected: false })

    // Decrypt to show masked versions
    let maskedAicc = ''
    let maskedResend = ''

    try {
      const parsed = JSON.parse(data.api_key)
      const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'fallback-32-byte-key-that-is-bad!'
      const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(parsed.iv, 'hex'))
      decipher.setAuthTag(Buffer.from(parsed.authTag, 'hex'))
      let decrypted = decipher.update(parsed.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      const keys = JSON.parse(decrypted)
      
      if (keys.resend) maskedResend = keys.resend.substring(0, 5) + '••••••••'
      if (keys.aicc) maskedAicc = keys.aicc.substring(0, 5) + '••••••••'
    } catch (e) {
      console.warn('Decryption failed for masking')
    }

    return NextResponse.json({ 
      connected: !!data, 
      config: {
        ...data,
        masked_resend: maskedResend,
        masked_aicc: maskedAicc
      } 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
