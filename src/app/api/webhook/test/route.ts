import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, email, name } = await req.json()
    if (!productId || !email) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const secret = process.env.WEBHOOK_HMAC_SECRET
    if (!secret) return NextResponse.json({ error: 'WEBHOOK_HMAC_SECRET not configured' }, { status: 500 })

    const payload = JSON.stringify({ email, name: name || 'Test User', test: true })
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    // Call the internal webhook endpoint
    const url = new URL(`/api/webhook/${productId}`, req.url)
    
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sendrix-signature': signature
      },
      body: payload
    })

    const data = await res.json()
    
    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.error || 'Webhook failed' }, { status: res.status })
    }

    return NextResponse.json({ success: true, message: 'Test connection successful', details: data })

  } catch (err: any) {
    console.error('Webhook test error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
