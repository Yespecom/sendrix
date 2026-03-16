'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SendrixLoader from '@/components/SendrixLoader'
import SendrixBrand from '@/components/SendrixBrand'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col justify-center items-center p-4">
      <SendrixBrand className="mb-8" />
      
      <div className="bg-white p-8 rounded-2xl shadow-[0_24px_64px_rgba(4,52,44,0.18)] max-w-md w-full border border-[#D3D1C7]">
        <h2 className="text-2xl font-bold text-[#0e0e10] mb-2">Reset your password</h2>
        <p className="text-[#5F5E5A] mb-8">Enter your email address and we'll send you a link to reset your password.</p>
        
        {success ? (
          <div className="bg-[#E1F5EE] border border-[#1D9E75] text-[#04342C] p-4 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Check your email for a reset link</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0e0e10] mb-1">Email address</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                className="w-full py-2.5 px-3 rounded-lg border border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-1 focus:ring-[#04342C] transition-shadow"
                placeholder="jane@company.com"
              />
            </div>

            {error && (
              <div className="text-[#D85A30] text-sm mt-2">{error}</div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#04342C] text-white py-3 rounded-lg font-medium shadow-[0_4px_16px_rgba(4,52,44,0.22)] hover:bg-[#03261F] transition mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SendrixLoader variant="dots" size="sm" label="Sending reset link" />
                  Sending link...
                </span>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm">
          <Link href="/login" className="text-[#04342C] font-semibold hover:underline flex justify-center items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
