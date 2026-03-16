'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Code, Terminal, Key, Play, ChevronRight } from 'lucide-react'

const DOC_SECTIONS = [
  {
    id: 'setup-flow',
    title: 'Complete Setup Flow',
    icon: <Play size={18} />,
    color: '#0F6E56',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <section>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0e0e10', marginBottom: 12 }}>1. Account & Resend Setup</h3>
          <p>Before sending emails, you must connect your Resend account. This allows Sendrix to send emails through your verified domain.</p>
          <div style={{ marginTop: 12, padding: '16px', background: '#F5F3EC', borderRadius: 12, border: '1px solid #D3D1C7' }}>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#5F5E5A', lineHeight: 2 }}>
              <li>Go to <strong>Settings &rarr; Email Delivery</strong></li>
              <li>Enter your <strong>Resend API Key</strong> (found in your Resend dashboard)</li>
              <li>Set your <strong>From Name</strong> and <strong>From Email</strong> (must be a verified domain on Resend)</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0e0e10', marginBottom: 12 }}>2. Creating your Workspace</h3>
          <p>A workspace represents your product. Creating one gives you a unique endpoint for automated enrollments.</p>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="setup-grid">
            <div style={{ padding: 16, background: '#E1F5EE', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#04342C' }}>AI Generation</div>
              <div style={{ fontSize: 12, color: '#0F6E56', lineHeight: 1.5 }}>Simply describe your product and targeted user persona. Our AI creates an onboarding sequence tailored to your brand.</div>
            </div>
            <div style={{ padding: 16, background: '#F5F3EC', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#0e0e10' }}>Configuring Delays</div>
              <div style={{ fontSize: 12, color: '#5F5E5A', lineHeight: 1.5 }}>Set timing for Day 0 (instant), Day 1, Day 3, etc. to keep users returning to your platform.</div>
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0e0e10', marginBottom: 12 }}>3. Webhook Integration</h3>
          <p>The final step is connecting your app's signup flow. When a user creates an account on your site, you notify Sendrix to start their sequence.</p>
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Implementation Example (Node.js)</div>
            <div style={{ background: '#0e0e10', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={14} color="#888780" />
                <span style={{ fontSize: 11, color: '#888780', fontFamily: 'monospace' }}>signup-handler.ts</span>
              </div>
              <pre style={{ margin: 0, padding: 20, color: '#D3D1C7', fontSize: 12, lineHeight: 1.6, overflowX: 'auto' }}>
{`async function onUserSignup(user) {
  const payload = JSON.stringify({
    email: user.email,
    name: user.firstName
  });

  // 1. Generate security signature
  const signature = crypto
    .createHmac('sha256', process.env.SENDRIX_HMAC_SECRET)
    .update(payload)
    .digest('hex');

  // 2. Transmit to your unique Sendrix endpoint
  await fetch('https://sendrix.com/api/webhook/[YOUR_ID]', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sendrix-Signature': signature
    },
    body: payload
  });
}`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    )
  },
  {
    id: 'authentication',
    title: 'Webhook Security',
    icon: <Shield size={18} />,
    color: '#D85A30',
    content: (
      <>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: '#FEF2F2', padding: 20, borderRadius: 12, border: '1px solid #FECACA', marginBottom: 24 }}>
          <Key size={20} color="#B91C1C" style={{ marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#B91C1C', marginBottom: 4 }}>Security Responsibility</div>
            <div style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>To prevent spam and unauthorized enrollments, every request to our API must include a valid HMAC signature in the <code>X-Sendrix-Signature</code> header.</div>
          </div>
        </div>

        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0e0e10', marginBottom: 12 }}>How it works</h4>
        <p>Sendrix uses an HMAC-SHA256 signature calculated from the JSON payload using your unique secret key. On our end, we perform the same calculation—if the signatures match, we know the request came from you.</p>

        <div style={{ marginTop: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0e0e10', marginBottom: 8 }}>The formula</h4>
          <div style={{ fontStyle: 'italic', fontSize: 13, color: '#5F5E5A', borderLeft: '3px solid #D3D1C7', paddingLeft: 16 }}>
            HMAC_SHA256(secret, body)
          </div>
        </div>
      </>
    )
  },
  {
    id: 'payloads',
    title: 'Webhook Email Integration Guide',
    icon: <Code size={18} />,
    color: '#0e0e10',
    content: (
      <>
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0e0e10', marginBottom: 8 }}>SaaS Email Onboarding Payload</h4>
          <p>Sendrix supports a lean payload for maximum flexibility during your Product Hunt launch or MVP phase.</p>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12, minWidth: 500 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #F5F3EC' }}>
                <th style={{ padding: '12px 8px', fontSize: 12, fontWeight: 800 }}>Field</th>
                <th style={{ padding: '12px 8px', fontSize: 12, fontWeight: 800 }}>Type</th>
                <th style={{ padding: '12px 8px', fontSize: 12, fontWeight: 800 }}>Required</th>
                <th style={{ padding: '12px 8px', fontSize: 12, fontWeight: 800 }}>Description</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: 13 }}>
              <tr style={{ borderBottom: '1px solid #F5F3EC' }}>
                <td style={{ padding: '12px 8px' }}><code>email</code></td>
                <td style={{ padding: '12px 8px', color: '#888780' }}>string</td>
                <td style={{ padding: '12px 8px' }}>✅</td>
                <td style={{ padding: '12px 8px' }}>User's email address.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F5F3EC' }}>
                <td style={{ padding: '12px 8px' }}><code>name</code></td>
                <td style={{ padding: '12px 8px', color: '#888780' }}>string</td>
                <td style={{ padding: '12px 8px' }}>❌</td>
                <td style={{ padding: '12px 8px' }}>User's full name or first name.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )
  }
]


export default function DocsContent() {
  const [activeTab, setActiveTab] = useState(DOC_SECTIONS[0].id)
  const activeSection = DOC_SECTIONS.find((section) => section.id === activeTab) || DOC_SECTIONS[0]

  return (
    <main className="flex-1 space-y-10">


      <section className="mx-auto flex w-full max-w-6xl px-6 pb-16">
        <div className="flex w-full flex-col gap-8 lg:flex-row">
          <aside className="hidden lg:block lg:w-[260px]">
            <div className="rounded-[24px] border border-[#D3D1C7] bg-white p-6 shadow-sm">

              <div className="mt-6 space-y-2">
                {DOC_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      activeTab === section.id
                        ? 'bg-[#04342C] text-white shadow-lg'
                        : 'text-[#5F5E5A] hover:bg-[#F5F3EC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: activeTab === section.id ? '#D3D1C7' : '#F5F3EC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: activeTab === section.id ? '#04342C' : '#0F6E56',
                        }}
                      >
                        {section.icon}
                      </div>
                      <span>{section.title}</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <div className="flex-1">
            <div className="rounded-[32px] border border-[#D3D1C7] bg-white p-8 shadow-[0_30px_60px_rgba(4,52,44,0.08)]">
              {activeSection && activeSection.content}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
