'use client'

import Link from 'next/link'
import { PLAN_CONFIG } from '@/lib/plans'

export default function SubscriptionPlansPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EC] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#888780] mb-2">Subscription plans</p>
          <h1 className="text-3xl font-extrabold text-[#0e0e10] leading-tight">Choose the plan that suits you</h1>
          <p className="text-sm text-[#5F5E5A] mt-2">All prices are shown in INR. Upgrade anytime from your dashboard.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(PLAN_CONFIG).map((plan) => (
            <div key={plan.label} className="border border-[#D3D1C7] rounded-[18px] bg-white p-5 shadow-sm flex flex-col gap-3">
              <div className="text-[11px] uppercase tracking-[.4em] text-[#888780]">{plan.label}</div>
              <div className="text-3xl font-black text-[#0e0e10]">{plan.priceLabel}</div>
              <p className="text-sm text-[#5F5E5A] leading-relaxed">
                {plan.maxProducts === null ? 'Unlimited workspaces' : `${plan.maxProducts} workspace${plan.maxProducts === 1 ? '' : 's'}`}
              </p>
              <p className="text-sm text-[#5F5E5A] leading-relaxed">
                {plan.maxEmailsPerMonth === null ? 'Unlimited emails' : `${plan.maxEmailsPerMonth.toLocaleString()} emails / mo`}
              </p>
              <Link
                href="/app/settings?tab=billing"
                className="mt-auto inline-flex items-center justify-center rounded-xl border border-[#04342C] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#04342C] hover:bg-[#04342C] hover:text-white transition"
              >
                Manage
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
