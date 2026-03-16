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

function decryptApiKey(encryptedKeyStr: string) {
  if (!encryptedKeyStr.startsWith('{')) return encryptedKeyStr
  const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'fallback-32-byte-key-that-is-bad!'
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  
  try {
    const { iv, encrypted, authTag } = JSON.parse(encryptedKeyStr)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    if (decrypted.startsWith('{')) {
      const keys = JSON.parse(decrypted)
      return keys.resend || ''
    }
    return decrypted
  } catch (e) {
    return encryptedKeyStr // Fallback for mangled encrypted data
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = user.id

    const { data: resendConfig } = await supabase
      .from('resend_config')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!resendConfig) {
      return NextResponse.json({ error: 'Resend not connected' }, { status: 400 })
    }

    const apiKey = decryptApiKey(resendConfig.api_key)
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: `${resendConfig.from_name} <${resendConfig.from_email}>`,
      to: user.email!,
      subject: 'Sendrix Connection Test',
      text: 'This is a test email from Sendrix to confirm your connection is working correctly. You are all set to start sending sequences!',
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Test email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
