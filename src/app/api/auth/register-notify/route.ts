import { NextResponse } from 'next/server'
import { triggerOnboardingWebhook } from '@/lib/webhook-notify'

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()
    const success = await triggerOnboardingWebhook(email, name)
    return NextResponse.json({ success })
  } catch (error: any) {
    console.error('Failed to notify signup:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
