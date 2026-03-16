'use client'

import { PLAN_CONFIG, Plan } from '@/lib/plans'

type Props = {
  planKey: Plan
  selected?: boolean
  highlight?: boolean
  onSelect?: (planKey: Plan) => void
  buttonLabel?: string
  disabled?: boolean
  compact?: boolean
  extraLabel?: string
}

const descriptions: Record<Plan, string> = {
  starter: 'Test the waters with one workspace and starter AI credits.',
  indie: 'Indie founders locked into founding pricing forever.',
  pro: 'Scale safely with priority support, unlimited workspaces, and AI.',
}

export default function PlanOptionCard({
  planKey,
  selected = false,
  highlight = false,
  onSelect,
  buttonLabel,
  disabled = false,
  compact = false,
  extraLabel,
}: Props) {
  const plan = PLAN_CONFIG[planKey]
  const isIndie = planKey === 'indie'
  const borderClass = selected ? 'border-[#04342C]' : highlight ? 'border-transparent' : 'border-[#D3D1C7]'
  const backgroundClass =
    selected
      ? 'bg-white'
      : highlight
      ? 'bg-[#04342C]'
      : 'bg-white'

  const features = [
    plan.maxProducts === null ? 'Unlimited workspaces' : `${plan.maxProducts} workspace${plan.maxProducts === 1 ? '' : 's'}`,
    plan.maxEmailsPerMonth === null ? 'Unlimited emails' : `${plan.maxEmailsPerMonth.toLocaleString()} emails / mo`,
    plan.maxAiGenerationsPerMonth === null ? 'Unlimited AI generation' : `${plan.maxAiGenerationsPerMonth} AI generations / mo`,
    planKey === 'starter' ? 'Webhook delivery' : planKey === 'indie' ? 'Locked-in pricing forever' : 'Priority support & Custom domain',
  ]

  return (
    <div
      className={`relative flex flex-col rounded-[28px] p-6 shadow-sm transition-all ${borderClass} border ${backgroundClass}`}
      style={{ minHeight: compact ? 320 : 360 }}
    >
      {isIndie && !selected && (
        <div className="absolute -top-3 left-1/2 flex translate-x-[-50%] rounded-full bg-[#EF9F27] px-5 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#04342C]">
          Founding Member
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] font-black uppercase tracking-[0.4em]" style={{ color: highlight && !selected ? '#E7F5EF' : '#0F6E56' }}>
          {plan.label}
        </div>
        {selected && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#0F6E56' }}>
            Active
          </span>
        )}
      </div>
      <div className="mt-5 text-4xl font-black" style={{ color: highlight && !selected ? '#fff' : '#0e0e10' }}>
        {plan.priceLabel}
      </div>
      <p className="mt-2 text-sm" style={{ color: highlight && !selected ? '#D3F0E9' : '#5F5E5A' }}>
        {descriptions[planKey]}
      </p>

      <ul className="mt-6 space-y-3 text-sm font-semibold" style={{ color: highlight && !selected ? '#E5F5EF' : '#5F5E5A' }}>
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <span className="text-xs" style={{ color: highlight && !selected ? '#D3F0E9' : '#0F6E56' }}>✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <button
          onClick={() => onSelect?.(planKey)}
          disabled={disabled || (!onSelect && !selected)}
          className={`w-full rounded-[14px] px-4 py-3 text-xs font-black uppercase tracking-[0.3em] transition ${
            highlight && !selected
              ? 'bg-white text-[#04342C]'
              : selected
              ? 'bg-[#04342C] text-white'
              : 'border border-[#D3D1C7] text-[#04342C] hover:bg-[#04342C] hover:text-white'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {selected ? 'Selected' : buttonLabel || 'Choose plan'}
        </button>
        {extraLabel && (
          <p className="mt-2 text-[11px] font-semibold text-[#BA7517] uppercase tracking-[0.3em]">
            {extraLabel}
          </p>
        )}
      </div>
    </div>
  )
}
