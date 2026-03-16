import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Sendrix | Affordable AI Email Automation',
  description: 'Simple, transparent pricing. Starter (free), Founding Member (₹999/mo), Pro (₹2999/mo). Lock in lifetime pricing. No hidden fees.',
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
