import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { z } from 'zod'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts/sequence-generator'

const EmailSchema = z.object({
  email_number: z.number().int().min(1).max(6),
  email_type: z.enum(["welcome","activation_nudge","feature_spotlight","social_proof","objection_handling","upgrade_nudge"]),
  subject: z.string().max(50),
  preview_text: z.string().max(90),
  body: z.string().max(2000),
  send_delay_days: z.number().int().min(0).max(30),
  cta_text: z.string().max(30),
  cta_url_placeholder: z.string(),
})

const SequenceSchema = z.array(EmailSchema).length(6)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

class ApiError extends Error {
  status: number
  retryAfterSeconds?: number

  constructor(status: number, message: string, retryAfterSeconds?: number) {
    super(message)
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

// Check if caller owns the product
async function verifyOwner(productId: string, userId: string): Promise<boolean> {
  const { data: product } = await supabase
    .from('products')
    .select('user_id')
    .eq('id', productId)
    .single()

  return product?.user_id === userId
}

// POST /api/products/generate-ai — GENERATE sequence using AICC (OpenAI SDK)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Fetch user's API keys if they exist
    let userAiccKey = process.env.AICC_API_KEY
    const { data: config } = await supabase.from('resend_config').select('api_key').eq('user_id', userId).maybeSingle()
    
    if (config?.api_key && config.api_key.startsWith('{')) {
      try {
        const parsed = JSON.parse(config.api_key)
        const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET || 'fallback-32-byte-key-that-is-bad!'
        const crypto = await import('crypto')
        const keyBuffer = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(parsed.iv, 'hex'))
        decipher.setAuthTag(Buffer.from(parsed.authTag, 'hex'))
        let decrypted = decipher.update(parsed.encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        const keys = JSON.parse(decrypted)
        if (keys.aicc) userAiccKey = keys.aicc
      } catch (e) {
        console.warn('Failed to decrypt user AICC key, falling back to system key', e)
      }
    }

    if (!userAiccKey) {
      throw new ApiError(500, 'No AICC_API_KEY available (system or user)')
    }

    const openai = new OpenAI({
      apiKey: userAiccKey,
      baseURL: "https://api.ai.cc/v1",
    })

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const isOwner = await verifyOwner(productId, userId)
    if (!isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Retrieve the product brief from Supabase
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('brief')
      .eq('id', productId)
      .single()

    if (productError || !product?.brief) {
      return NextResponse.json({ error: 'Product not found or brief incomplete' }, { status: 404 })
    }

    const {
      product_name,
      target_user,
      core_problem,
      activation_action,
      upgrade_incentive,
      tone,
      founder_name,
      product_url
    } = product.brief

    const userPrompt = buildUserPrompt({
      productName: product_name,
      targetUser: target_user,
      coreProblem: core_problem,
      activationAction: activation_action,
      upgradeIncentive: upgrade_incentive,
      tone: tone as any,
      founderName: founder_name,
      productUrl: product_url
    })

    let parsedEmails: z.infer<typeof SequenceSchema> | null = null
    let lastError: any = null
    let firstAttemptRaw = ""

    try {
      const completion = await openai.chat.completions.create({
        model: "claude-sonnet-4-6",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      })

      firstAttemptRaw = completion.choices[0].message.content || ''
      let text = firstAttemptRaw
      
      // Strip out any markdown fences
      text = text.replace(/```json/g, '').replace(/```/g, '').trim()
      
      const rawJson = JSON.parse(text)
      parsedEmails = SequenceSchema.parse(rawJson)
    } catch (err: any) {
      console.error(`First AICC generation attempt failed:`, err)
      
      if (err.status === 429) {
        throw new ApiError(429, 'AI quota exceeded. Please try again in 30 seconds.')
      }

      // Retry once with an explicit correction instruction if it was a parsing/validation error
      try {
        console.log("Attempting retry with fix instruction...")
        const retryCompletion = await openai.chat.completions.create({
          model: "claude-sonnet-4-6",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
            { role: "assistant", content: firstAttemptRaw },
            { role: "user", content: "Your response was not valid JSON. Return ONLY the raw JSON array, no text before or after it. Ensure it follows the exact schema requested." },
          ],
          temperature: 0.3, // Lower temperature for more deterministic/safe retry
        })

        let retryText = retryCompletion.choices[0].message.content || ''
        retryText = retryText.replace(/```json/g, '').replace(/```/g, '').trim()
        
        const rawJson = JSON.parse(retryText)
        parsedEmails = SequenceSchema.parse(rawJson)
      } catch (retryErr: any) {
        lastError = retryErr
        console.error(`Retry attempt failed:`, retryErr)
      }
    }

    if (!parsedEmails) {
      if (lastError instanceof Error) {
        throw lastError
      }
      throw new Error(`Failed to generate valid sequence after 2 attempts`)
    }

    // Insert or update into sequences table
    const { error: seqError } = await supabase
      .from('sequences')
      .upsert({
        product_id: productId,
        emails: parsedEmails
      }, { onConflict: 'product_id' })

    if (seqError) {
      console.error(seqError)
      throw new Error('Failed to save sequence to database')
    }

    return NextResponse.json({ success: true, sequence: parsedEmails })

  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message },
        {
          status: err.status,
          headers: err.retryAfterSeconds
            ? { 'Retry-After': String(err.retryAfterSeconds) }
            : undefined
        }
      )
    }

    console.error('Sequence generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    reachable: true, 
    provider: 'aicc', 
    model: 'claude-sonnet-4-6',
    time: new Date().toISOString() 
  })
}
