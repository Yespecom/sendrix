'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, MessageCircle, Sparkles, X } from 'lucide-react'

type TopicKey = 'start' | 'resend' | 'webhook'

type TopicConfig = {
  userQuestion: string
  title: string
  summary: string
  steps: string[]
  primaryHref: string
  primaryLabel: string
}

const TOPICS: Record<TopicKey, TopicConfig> = {
  start: {
    userQuestion: 'How do I start Sendrix?',
    title: 'Quick Start Guide',
    summary: '6 emails written by AI, sent from your domain, in 10 minutes.',
    steps: [
      'Sign in with Google.',
      'Create your workspace and product.',
      'Fill the product brief (user, pain, activation action, tone).',
      'Generate and review your 6-email sequence.',
      'Connect Resend and publish the flow.'
    ],
    primaryHref: '/signup',
    primaryLabel: 'Start with Google'
  },
  resend: {
    userQuestion: 'How do I connect Resend?',
    title: 'Resend Setup',
    summary: 'Activate email delivery with your verified sender domain.',
    steps: [
      'Open your product preview in Sendrix.',
      'Click Connect Resend.',
      'Paste your Resend API key.',
      'Set and verify your sender email/domain.',
      'Send a test email and activate the pipeline.'
    ],
    primaryHref: '/app/resend',
    primaryLabel: 'Open Resend Setup'
  },
  webhook: {
    userQuestion: 'How do I trigger emails with webhook?',
    title: 'Webhook Setup',
    summary: 'Push new users from your app to start the sequence automatically.',
    steps: [
      'Open your workspace and copy the product webhook URL.',
      'Call it when a new user signs up or activates.',
      'Send user email + product context in your payload.',
      'Confirm request logs in Activity Logs.',
      'Validate sequence timing from the preview.'
    ],
    primaryHref: '/docs',
    primaryLabel: 'View Webhook Docs'
  }
}

export default function LandingChatPopup() {
  const [open, setOpen] = useState(false)
  const [activeTopic, setActiveTopic] = useState<TopicKey>('start')
  const [showHint, setShowHint] = useState(true)
  const topic = useMemo(() => TOPICS[activeTopic], [activeTopic])

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 9000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[70] flex flex-col items-end gap-3">
      <div
        className={`w-[min(94vw,390px)] sm:w-[370px] max-h-[min(78vh,560px)] rounded-2xl border border-[#D3D1C7] bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none ${
          open
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-3 scale-[0.98] pointer-events-none'
        }`}
      >
        <div className="bg-[#04342C] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-white/15 inline-flex items-center justify-center">
              <Sparkles size={14} />
            </span>
            <div>
              <p className="text-sm font-semibold">Sendrix Assistant</p>
              <p className="text-[11px] text-white/75">Live setup help</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 bg-[#F9F7F1] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTopic('start')}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeTopic === 'start'
                  ? 'bg-[#04342C] text-white border-[#04342C]'
                  : 'bg-white text-[#0e0e10] border-[#D3D1C7] hover:border-[#0F6E56]'
              }`}
            >
              Getting Started
            </button>
            <button
              type="button"
              onClick={() => setActiveTopic('resend')}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeTopic === 'resend'
                  ? 'bg-[#04342C] text-white border-[#04342C]'
                  : 'bg-white text-[#0e0e10] border-[#D3D1C7] hover:border-[#0F6E56]'
              }`}
            >
              Connect Resend
            </button>
            <button
              type="button"
              onClick={() => setActiveTopic('webhook')}
              className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeTopic === 'webhook'
                  ? 'bg-[#04342C] text-white border-[#04342C]'
                  : 'bg-white text-[#0e0e10] border-[#D3D1C7] hover:border-[#0F6E56]'
              }`}
            >
              Webhook Setup
            </button>
          </div>

          <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[#04342C] text-white px-3 py-2 text-sm">
            {topic.userQuestion}
          </div>

          <div className="max-w-[95%] rounded-2xl rounded-bl-md bg-white border border-[#E5E2D7] px-3 py-3 text-sm text-[#2E2D29]">
            <p className="font-semibold text-[#0e0e10] mb-1">{topic.title}</p>
            <p className="text-xs text-[#5F5E5A] mb-3">{topic.summary}</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              {topic.steps.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={topic.primaryHref}
              className="px-3 py-2 rounded-lg bg-[#04342C] text-white text-xs font-semibold hover:bg-[#03261F] inline-flex items-center gap-1.5"
            >
              {topic.primaryLabel}
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/docs"
              className="px-3 py-2 rounded-lg border border-[#D3D1C7] text-[#0e0e10] text-xs font-semibold hover:bg-white"
            >
              Read docs
            </Link>
          </div>
        </div>
      </div>

      {!open && showHint ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            setShowHint(false)
          }}
          className="rounded-full border border-[#D3D1C7] bg-white px-4 py-2 text-xs font-semibold text-[#2E2D29] shadow-md hover:border-[#0F6E56] transition"
          aria-label="Open sendrix assistant"
        >
          Need help starting Sendrix?
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setOpen(prev => !prev)
          setShowHint(false)
        }}
        className={`mt-0 ml-auto w-14 h-14 rounded-full text-white shadow-xl inline-flex items-center justify-center transition-all duration-300 ${
          open ? 'bg-[#0F6E56] rotate-90' : 'bg-[#04342C] hover:bg-[#03261F]'
        }`}
        aria-label={open ? 'Close chat help' : 'Open chat help'}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  )
}
