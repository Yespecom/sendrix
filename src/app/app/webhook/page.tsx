'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function WebhookRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/settings?tab=webhook') }, [])
  return null
}
