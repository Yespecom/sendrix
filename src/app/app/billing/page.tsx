'use client'

import { useEffect, useState } from 'react'
import PlanOptionCard from '@/components/PlanOptionCard'
import { Plan, resolveSignupPlanSelection } from '@/lib/plans'

type AccountSummary = {
  plan: Plan
  foundingMember: boolean
  planLabel: string
  priceLabel: string
  nextBillingDate?: string
  lastPaymentId?: string
  limits: {
    maxProducts: number | null
    maxAiGenerationsPerMonth: number | null
    maxEmailsPerMonth: number | null
  }
}

const PLAN_KEYS: Plan[] = ['starter', 'indie', 'pro']

export default function BillingPage() {
  const [account, setAccount] = useState<AccountSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [updatingPlan, setUpdatingPlan] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/user/plan')
        if (res.ok) {
          const payload = await res.json()
          setAccount(payload.account)
        } else {
          setStatus('Unable to load plan details.')
        }
      } catch (err) {
        console.error(err)
        setStatus('Unable to load billing details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handlePlanChange = async (planKey: Plan) => {
    if (updatingPlan) return
    const resolved = resolveSignupPlanSelection(planKey)
    if (account?.plan === resolved.plan && account?.foundingMember === resolved.foundingMember) {
      setStatus('You are already on this plan.')
      return
    }
    setUpdatingPlan(true)
    setStatus('Updating your plan…')

    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedPlan: resolved.selection }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload.error || 'Plan update failed.')
      }
      setAccount(payload.account)
      setStatus('Plan updated successfully.')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Plan update failed.')
    } finally {
      setUpdatingPlan(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC] px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-[#D3D1C7] bg-white p-10 shadow-[0_35px_80px_rgba(4,52,44,0.12)]">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0F6E56]">Billing & plans</p>
              <h1 className="mt-3 text-3xl font-extrabold text-[#0e0e10]">Your Subscription</h1>
              <p className="mt-2 text-sm text-[#5F5E5A] max-w-2xl">
                Manage your plan and billing details. Your founding price is locked as long as your subscription remains active.
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#F5F3EC] border border-[#D3D1C7]">
                  <div className="text-[11px] font-bold text-[#888780] uppercase tracking-wider mb-1">Current Plan</div>
                  <div className="text-lg font-bold text-[#0e0e10] flex items-center gap-2">
                    {account?.planLabel} {account?.foundingMember && <span className="text-[10px] bg-[#04342C] text-white px-2 py-0.5 rounded-full uppercase">Founding</span>}
                  </div>
                  <div className="text-xs text-[#5F5E5A] mt-1">{account?.priceLabel}</div>
                </div>
                
                <div className="p-5 rounded-2xl bg-[#F5F3EC] border border-[#D3D1C7]">
                  <div className="text-[11px] font-bold text-[#888780] uppercase tracking-wider mb-1">Next Payment</div>
                  <div className="text-lg font-bold text-[#0e0e10]">
                    {formatDate(account?.nextBillingDate)}
                  </div>
                  <div className="text-xs text-[#5F5E5A] mt-1">Automatic renewal</div>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <div className="rounded-[24px] border border-[#D3D1C7] bg-white p-6 md:w-72">
                <h3 className="text-sm font-bold text-[#0e0e10] mb-4">Last Invoice</h3>
                {account?.lastPaymentId ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-[#F5F3EC] text-xs font-mono text-[#5F5E5A] break-all">
                      ID: {account.lastPaymentId}
                    </div>
                    <a 
                      href={`https://dashboard.razorpay.com/app/payments/${account.lastPaymentId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#04342C] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#03261F] hover:shadow-lg"
                    >
                      Download Invoice
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-[#888780] italic">No invoices found yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center gap-3">
             <div className="h-px flex-1 bg-[#D3D1C7]"></div>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#888780]">Available Plans</p>
             <div className="h-px flex-1 bg-[#D3D1C7]"></div>
          </div>

          {loading ? (
            <div className="rounded-[28px] border border-dashed border-[#D3D1C7] bg-white/80 p-8 text-center text-sm text-[#888780]">
              Fetching your plan options…
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                {PLAN_KEYS.map((planKey) => (
                  <PlanOptionCard
                    key={planKey}
                    planKey={planKey}
                    selected={account?.plan === planKey}
                    highlight={planKey === 'indie'}
                    onSelect={handlePlanChange}
                    buttonLabel={account?.plan === planKey ? 'Current plan' : 'Select plan'}
                    disabled={updatingPlan}
                    extraLabel={
                      planKey === 'starter'
                        ? '1 workspace'
                        : planKey === 'indie'
                        ? '3 workspaces · locked price'
                        : 'Unlimited everything'
                    }
                  />
                ))}
              </div>
              {status && (
                <div className="mt-6 rounded-[24px] border border-[#D3D1C7] bg-white px-5 py-4 text-sm font-semibold text-[#04342C] flex items-center justify-between shadow-sm">
                  <span>{status}</span>
                  <button onClick={() => setStatus('')} className="text-[#888780] hover:text-[#0e0e10]">✕</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
