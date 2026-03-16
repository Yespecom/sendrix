import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { Resend } from 'resend'
import { renderEmailTemplateHtml } from '@/lib/email-design-templates'

// Since this is a public webhook, we bypass RLS by using the Service Role Key
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake-key'
)

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

export async function POST(req: Request, { params }: { params: { productId: string } }) {
  const supabase = getSupabase()
  try {
    const productId = params.productId
    const rawBody = await req.text()
    
    // 1. Verify HMAC
    const signature = req.headers.get('x-sendrix-signature')
    const secret = process.env.WEBHOOK_HMAC_SECRET
    
    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing signature or secret config' }, { status: 401 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Parse body
    const body = JSON.parse(rawBody)
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // 3. Check for duplicate subscriber
    const { data: existingSub } = await supabase
      .from('subscribers')
      .select('id')
      .eq('product_id', productId)
      .eq('email', email)
      .single()

    if (existingSub) {
      console.log(`Duplicate enrollment skipped for ${email}`)
      return NextResponse.json({ enrolled: true, message: 'Already enrolled' })
    }

    // 4. Handle Test Connection (Bypass sequence requirement)
    if (body.test) {
      return NextResponse.json({ enrolled: true, message: 'Test connection successful' })
    }

    // Fetch Sequence + Product info + Resend config
    const { data: sequence, error: seqError } = await supabase
      .from('sequences')
      .select('emails') // Removed design_key for now as column might be missing
      .eq('product_id', productId)
      .single()

    // Try to get design_key separately if possible, or fallback
    const { data: designData } = await supabase
      .from('sequences')
      .select('design_key')
      .eq('product_id', productId)
      .maybeSingle()
    
    const designKey = (designData as any)?.design_key || 'clean_minimal'

    const { data: product } = await supabase
      .from('products')
      .select('user_id')
      .eq('id', productId)
      .single()
      
    if (!sequence || !product) {
      return NextResponse.json({ error: 'Sequence or product not found' }, { status: 404 })
    }

    const { data: resendConfig } = await supabase
      .from('resend_config')
      .select('*')
      .eq('user_id', product.user_id)
      .single()

    // 4. Create subscriber
    const { data: subscriber, error: subError } = await supabase
      .from('subscribers')
      .insert({
        product_id: productId,
        email,
        name,
        status: 'enrolled'
      })
      .select('id')
      .single()

    if (subError || !subscriber) {
      throw new Error('Failed to create subscriber')
    }

    // 5. Create email logs
    const now = new Date()
    const logsToInsert = sequence.emails.map((emailObj: any, index: number) => {
      const scheduledAt = new Date(now.getTime() + emailObj.send_delay_days * 24 * 60 * 60 * 1000)
      return {
        subscriber_id: subscriber.id,
        email_number: index,
        status: 'pending',
        scheduled_at: scheduledAt.toISOString(),
      }
    })

    const { data: createdLogs, error: logError } = await supabase
      .from('email_logs')
      .insert(logsToInsert)
      .select('id, email_number')

    if (logError) throw new Error('Failed to create email logs')

    // 6. Send Day 0 email immediately if resend is configured
    if (resendConfig) {
      const dayZeroEmail = sequence.emails.find((e: any) => e.send_delay_days === 0)
      const dayZeroLog = createdLogs?.find((l: any) => l.email_number === sequence.emails.indexOf(dayZeroEmail))

      if (dayZeroEmail && dayZeroLog) {
        try {
          const apiKey = decryptApiKey(resendConfig.api_key)
          const resend = new Resend(apiKey)
          
          const html = renderEmailTemplateHtml({
            templateKey: designKey,
            subject: dayZeroEmail.subject,
            body: dayZeroEmail.body,
            ctaText: dayZeroEmail.cta_text,
            ctaUrl: dayZeroEmail.cta_url,
            productName: resendConfig.product_name || 'Sendrix',
            senderName: resendConfig.from_name || 'Founder',
            dayIndex: 0
          })

          await resend.emails.send({
            from: `${resendConfig.from_name} <${resendConfig.from_email}>`,
            to: email,
            subject: dayZeroEmail.subject,
            html,
          })

          // 7. Update Day 0 log
          await supabase
            .from('email_logs')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', dayZeroLog.id)

        } catch (err: any) {
          console.error('Failed to send Day 0 email:', err)
          await supabase
            .from('email_logs')
            .update({ status: 'failed' })
            .eq('id', dayZeroLog.id)
        }
      }
    }

    // 8. Return success
    return NextResponse.json({ enrolled: true, subscriber_id: subscriber.id })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
