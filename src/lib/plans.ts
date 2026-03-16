export type Plan = 'starter' | 'indie' | 'pro'
export type SignupPlanSelection = 'free' | 'founding' | 'pro'

const USD_TO_INR = 83

function formatInr(usd: number) {
  const inr = Math.round(usd * USD_TO_INR)
  return `₹${inr.toLocaleString('en-IN')}/mo`
}

type PlanConfig = {
  label: string
  priceUsd: number
  priceInr: number
  priceLabel: string
  maxProducts: number | null
  maxAiGenerationsPerMonth: number | null
  maxEmailsPerMonth: number | null
}

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  starter: {
    label: 'Starter',
    priceUsd: 0,
    priceInr: 0,
    priceLabel: '₹0',
    maxProducts: 1,
    maxAiGenerationsPerMonth: 3,
    maxEmailsPerMonth: 500,
  },
  indie: {
    label: 'Indie',
    priceUsd: 12,
    priceInr: 999,
    priceLabel: '₹999',
    maxProducts: 3,
    maxAiGenerationsPerMonth: 20,
    maxEmailsPerMonth: null,
  },
  pro: {
    label: 'Pro',
    priceUsd: 36,
    priceInr: 2999,
    priceLabel: '₹2,999',
    maxProducts: null,
    maxAiGenerationsPerMonth: null,
    maxEmailsPerMonth: null,
  },
}

export function normalizePlan(value?: string | null): Plan {
  const normalized = String(value || '').trim().toLowerCase()
  if (normalized === 'pro') return 'pro'
  if (normalized === 'indie' || normalized === 'founding') return 'indie'
  return 'starter'
}

export function resolveSignupPlanSelection(value?: string | null): {
  selection: SignupPlanSelection
  plan: Plan
  foundingMember: boolean
} {
  const normalized = String(value || '').trim().toLowerCase()

  if (normalized === 'pro') {
    return { selection: 'pro', plan: 'pro', foundingMember: false }
  }

  if (normalized === 'founding' || normalized === 'indie') {
    return { selection: 'founding', plan: 'indie', foundingMember: true }
  }

  return { selection: 'free', plan: 'starter', foundingMember: false }
}

export function getPlanLabel(plan: Plan, foundingMember = false): string {
  if (plan === 'indie' && foundingMember) return 'Founding Member'
  return PLAN_CONFIG[plan].label
}
