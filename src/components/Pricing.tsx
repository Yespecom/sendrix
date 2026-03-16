'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Check, ArrowRight, Award, Rocket } from 'lucide-react'
import { PLAN_CONFIG } from '@/lib/plans'

export default function Pricing() {
  const { data: session, status } = useSession()
  const [userPlan, setUserPlan] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlan() {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/user/plan')
          if (res.ok) {
            const data = await res.json()
            if (data.account) {
              setUserPlan(data.account.plan)
            }
          }
        } catch (err) {
          console.error('Failed to fetch plan:', err)
        }
      }
    }
    fetchPlan()
  }, [status])
  return (
    <section className="py-24 px-6 bg-[#F5F3EC]" id="pricing">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0e0e10] mb-4">Simple, transparent pricing.</h2>
          <p className="text-xl text-[#5F5E5A]">Join as a founding member to lock in your rate forever.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter */}
          <div className="bg-white rounded-[24px] p-8 border border-[#D3D1C7] shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#0e0e10] mb-2">Starter</h3>
              <p className="text-[#5F5E5A] text-sm mb-6">Perfect to test the waters.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#0e0e10]">₹0</span>
                <span className="text-[#888780] font-medium">/mo</span>
              </div>
              <ul className="space-y-4 text-sm font-medium text-[#5F5E5A] mb-8">
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ 1 Workspace</li>
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ 3 AI generations / month</li>
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ 1 Email sequence</li>
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ Resend integration</li>
              </ul>
            </div>
            {userPlan === 'starter' ? (
              <div className="w-full py-3 rounded-xl bg-[#E1F5EE] text-[#04342C] font-bold flex items-center justify-center gap-2 mt-auto border border-[#9FE1CB]">
                <Check size={16} /> Current Plan
              </div>
            ) : (
              <Link href="/signup?plan=free" className="block text-center w-full py-3 rounded-xl border-2 border-[#D3D1C7] text-[#0e0e10] font-bold hover:bg-[#F5F3EC] transition mt-auto">
                Start for free
              </Link>
            )}
          </div>

          {/* Indie (Highlighted as Founding Member) */}
          <div className="bg-[#04342C] rounded-[24px] p-8 border border-[#EF9F27] shadow-modal relative transform scale-100 md:scale-105 z-10 flex flex-col">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#EF9F27] text-[#04342C] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              Founding Member
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">Founding Member</h3>
              <p className="text-[#E1F5EE] text-sm mb-6">For serious solo founders.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">₹999</span>
                <span className="text-[#E1F5EE]/70 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 text-sm font-medium text-white mb-8">
                <li className="flex items-center gap-2">✓ Up to 3 Workspaces</li>
                <li className="flex items-center gap-2">✓ 20 AI generations / month</li>
                <li className="flex items-center gap-2">✓ Resend integration + Analytics</li>
                <li className="flex items-center gap-2">✓ Premium support</li>
                <li className="flex items-center gap-2 text-[#EF9F27]">✓ Locked-in pricing forever</li>
              </ul>
            </div>
            {userPlan === 'indie' ? (
              <div className="w-full py-3 rounded-xl bg-[#E1F5EE]/10 text-white font-bold flex items-center justify-center gap-2 mt-auto border border-white/20">
                <Check size={16} /> Current Plan
              </div>
            ) : (
              <Link href="/signup?plan=founding" className="block text-center w-full py-3 rounded-xl bg-[#EF9F27] text-[#04342C] font-extrabold hover:bg-[#BA7517] hover:text-white transition shadow-btn mt-auto">
                Claim founding spot
              </Link>
            )}
          </div>

          {/* Pro */}
          <div className="bg-white rounded-[24px] p-8 border border-[#D3D1C7] shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#0e0e10] mb-2">Pro</h3>
              <p className="text-[#5F5E5A] text-sm mb-6">For scaling startups.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-[#0e0e10]">₹2,999</span>
                <span className="text-[#888780] font-medium">/mo</span>
              </div>
              <ul className="space-y-4 text-sm font-medium text-[#5F5E5A] mb-8">
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ Unlimited Workspaces</li>
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ Unlimited AI generation</li>
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ A/B subject line testing</li>
                <li className="flex items-center gap-2 text-[#0e0e10]">✓ Agency grade delivery</li>
              </ul>
            </div>
            {userPlan === 'pro' ? (
              <div className="w-full py-3 rounded-xl bg-[#E1F5EE] text-[#0F6E56] font-bold flex items-center justify-center gap-2 mt-auto border border-[#9FE1CB]">
                <Check size={16} /> Current Plan
              </div>
            ) : (
              <Link href="/signup?plan=pro" className="block text-center w-full py-3 rounded-xl border-2 border-[#D3D1C7] text-[#0e0e10] font-bold hover:bg-[#F5F3EC] transition mt-auto">
                Get Pro Access
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
