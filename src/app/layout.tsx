import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sendrix - AI Onboarding Email Sequences | SaaS Automation',
  description: 'Create agency-grade email sequences in 10 minutes. AI-written, Resend-powered, webhook-ready. For founders, agencies, & indie hackers.',
  keywords: [
    'AI onboarding software',
    'automated email sequences SaaS',
    'product activation emails',
    'user onboarding automation',
    'SaaS email onboarding',
    'automated welcome emails',
    'AI email copywriting tool',
    'onboarding sequence generator'
  ],
  metadataBase: new URL('https://sendrix.in'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Sendrix - AI Onboarding Email Sequences | SaaS Automation',
    description: 'Create agency-grade email sequences in 10 minutes. AI-written, Resend-powered, webhook-ready.',
    images: ['/sendrix_og_image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sendrix - AI Onboarding Email Sequences | SaaS Automation',
    description: 'Create agency-grade email sequences in 10 minutes. AI-written, Resend-powered, webhook-ready.',
    images: ['/sendrix_twitter_fixed.svg'],
  },
}

import { Providers } from '@/components/Providers'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppins.className} antialiased min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
