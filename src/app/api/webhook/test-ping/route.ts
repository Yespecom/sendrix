import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId, email, name } = await req.json()
    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${appUrl}/api/webhook/${productId}`
    const secret = process.env.WEBHOOK_HMAC_SECRET
    
    if (!secret) return NextResponse.json({ error: 'Webhook secret not configured on server' }, { status: 500 })

    const payload = JSON.stringify({ 
      email: email || session.user.email, 
      name: name || session.user.name || 'Test User',
      test: true 
    })
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sendrix-signature': signature
      },
      body: payload
    })

    const data = await res.json()
    return NextResponse.json({ 
      status: res.status,
      success: res.ok,
      response: data
    })
  } catch (error: any) {
    console.error('Test webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
