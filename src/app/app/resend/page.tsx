'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function ResendRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/settings?tab=resend') }, [])
  return null
}
