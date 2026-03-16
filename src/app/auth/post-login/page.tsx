'use client'

import { useEffect } from 'react'
import { getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SendrixLoader from '@/components/SendrixLoader'

export default function PostLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  useEffect(() => {
    let isMounted = true

    const evaluateDestination = async () => {
      try {
        // 1. Check if user already has products
        const res = await fetch('/api/products')
        if (res.ok) {
          const { products } = await res.json()
          if (products && products.length > 0) {
            // Existing user with data -> DASHBOARD
            if (isMounted) router.replace('/app/dashboard')
            return
          }
        }

        // 2. If no products, they are either new or abandoned onboarding
        // Only apply plan if it was explicitly passed in the URL (from a pricing/signup page)
        const planToApply = searchParams.get('selectedPlan') || searchParams.get('plan')
        if (planToApply) {
          await fetch('/api/user/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedPlan: planToApply })
          }).catch(err => console.error('Plan application failed', err))
        }

        // 3. Trigger onboarding webhook if new user
        const session = await getSession()
        if (session?.user?.email) {
          fetch('/api/auth/register-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: session.user.email, 
              name: session.user.name || 'Founder' 
            })
          }).catch(err => console.error('Failed to trigger onboarding:', err))
        }

        // 4. Send to onboarding
        if (isMounted) {
          router.replace(`/onboarding-workspace-setup${planToApply ? `?selectedPlan=${planToApply}` : ''}`)
        }
      } catch (error) {
        console.error('Post login routing failed:', error)
        if (isMounted) router.replace('/onboarding-workspace-setup')
      }
    }

    evaluateDestination()

    return () => {
      isMounted = false
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC] p-6">
      <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white p-8 text-center shadow-xl">
        <SendrixLoader variant="full" size="lg" label="Preparing your workspace" />
        <p className="text-sm font-medium text-[#5F5E5A]">Securing your account and routing you to the right place…</p>
      </div>
    </div>
  )
}
