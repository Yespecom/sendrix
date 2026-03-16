import crypto from 'crypto'

export async function triggerOnboardingWebhook(email: string, name: string) {
  try {
    const sequenceId = 'b68f71fa-982e-46fe-bc1a-cc4ad883c3eb'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = `${appUrl}/api/webhook/${sequenceId}`
    const secret = process.env.WEBHOOK_HMAC_SECRET || 'sendrix_onboarding_secret_2024'
    
    const payload = JSON.stringify({ email, name })
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
      
    console.log(`[Webhook] Triggering onboarding for ${email}`)
    
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sendrix-signature': signature
      },
      body: payload
    })
    
    if (!res.ok) {
      const errText = await res.text()
      console.error(`[Webhook] Failed: ${res.status} ${errText}`)
    } else {
      console.log(`[Webhook] Successfully triggered for ${email}`)
    }
    
    return res.ok
  } catch (error) {
    console.error('[Webhook] Error triggering onboarding:', error)
    return false
  }
}
