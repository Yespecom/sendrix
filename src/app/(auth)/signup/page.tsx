'use client'

import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signIn } from 'next-auth/react'
import SendrixLoader from '@/components/SendrixLoader'
import SendrixBrand from '@/components/SendrixBrand'
import { resolveSignupPlanSelection } from '@/lib/plans'

// Simple SVG for Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const selectedPlan = resolveSignupPlanSelection(
    searchParams.get('plan') || searchParams.get('selectedPlan')
  )
  const onboardingCallback = `/auth/post-login?selectedPlan=${selectedPlan.selection}`

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    terms: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleOAuth = async (provider: 'google') => {
    await signIn(provider, { callbackUrl: onboardingCallback })
  }

  const applySelectedPlan = async () => {
    try {
      await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedPlan: selectedPlan.selection })
      })
    } catch (err) {
      console.error('Failed to apply selected plan:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.terms) {
      setError('You must accept the terms and conditions')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    // Create the user in Supabase first
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName
        }
      }
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Now sign them in via NextAuth using credentials
    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    })

    setIsLoading(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.ok) {
      await applySelectedPlan()

      // Trigger onboarding sequence via webhook
      try {
        fetch('/api/auth/register-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            name: formData.fullName 
          })
        })
      } catch (err) {
        console.error('Failed to trigger onboarding:', err)
      }

      router.push(onboardingCallback)
    }
  }

  // Password strength basic check
  const pwLength = formData.password.length
  let score = 0
  if (pwLength > 6) score += 1
  if (pwLength >= 8 && /[A-Z]/.test(formData.password)) score += 1
  if (/[0-9]/.test(formData.password) && /[^A-Za-z0-9]/.test(formData.password)) score += 1
  if (pwLength > 12) score += 1

  const strengthColors = ['bg-[#D85A30]', 'bg-[#EF9F27]', 'bg-[#1D9E75]', 'bg-[#04342C]']
  const submitLabel =
    selectedPlan.selection === 'free'
      ? 'Create free account'
      : selectedPlan.selection === 'founding'
      ? 'Claim founding spot'
      : 'Get Pro'

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex w-[48%] bg-[#04342C] text-white p-16 flex-col justify-between">
        <div>
          <div className="mb-16">
            <SendrixBrand theme="dark" />
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-8">
            Create onboarding sequences that{' '}
            <span className="relative z-10">
              actually convert.
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#EF9F27] -z-10 bg-opacity-80"></span>
            </span>
          </h1>
          
          <div className="space-y-4 text-[#E1F5EE] text-lg">
            {['Write weeks of emails in 8 seconds', 'Highest converting templates standard', 'Seamless Razorpay integration', 'Guaranteed premium delivery'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 fill="#EF9F27" className="text-[#04342C] w-6 h-6 border-none" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#03261F] p-6 rounded-2xl border border-white/10 mt-12">
          <p className="italic text-[#E1F5EE] mb-4">"Sendrix essentially replaced a $4k/mo copywriter for my SaaS. The activation rates are honestly better."</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 flex items-center justify-center rounded-full font-bold">A</div>
            <div>
              <div className="font-semibold text-white">Alex M.</div>
              <div className="text-[#888780] text-sm">Founder, Invoicely</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-[100%] lg:w-[52%] bg-[#F5F3EC] p-8 lg:p-16 flex flex-col justify-center items-center relative">
        {/* Back to home */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#5F5E5A] hover:text-[#04342C] transition-colors group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to home
          </Link>
        </div>
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-[#0e0e10] mb-2">Create your account</h2>
          <p className="text-[#5F5E5A] mb-8">Join the waitlist today to be one of our first 100 founders.</p>
          
          <div className="mb-6">
            <button 
              onClick={() => handleOAuth('google')}
              className="w-full flex justify-center items-center gap-2 py-2.5 border border-[#D3D1C7] rounded-lg text-[#0e0e10] font-medium hover:bg-black/5 transition"
            >
              <GoogleIcon /> Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <hr className="flex-1 border-[#D3D1C7]" />
            <span className="text-sm text-[#888780]">OR</span>
            <hr className="flex-1 border-[#D3D1C7]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0e0e10] mb-1">Full name</label>
              <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full py-2.5 px-3 rounded-lg border border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-1 focus:ring-[#04342C] transition-shadow"
                placeholder="Jane Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#0e0e10] mb-1">Email address</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full py-2.5 px-3 rounded-lg border border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-1 focus:ring-[#04342C] transition-shadow"
                placeholder="jane@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0e0e10] mb-1">Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full py-2.5 pl-3 pr-10 rounded-lg border border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-1 focus:ring-[#04342C] transition-shadow"
                  placeholder="Create a password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888780] hover:text-[#0e0e10]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength meter */}
              {formData.password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div 
                      key={idx} 
                      className={`h-1 flex-1 rounded-full ${score > idx ? strengthColors[score-1] : 'bg-[#D3D1C7]'}`}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 mt-4">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-1 rounded text-[#04342C] focus:ring-[#04342C] w-4 h-4 border-[#D3D1C7]"
                checked={formData.terms}
                onChange={e => setFormData({...formData, terms: e.target.checked})}
              />
              <label htmlFor="terms" className="text-sm text-[#5F5E5A]">
                I agree to the <Link href="/terms" className="text-[#04342C] underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#04342C] underline">Privacy Policy</Link>.
              </label>
            </div>

            {error && <div className="text-[#D85A30] text-sm mt-2">{error}</div>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#04342C] text-white py-3 rounded-lg font-medium shadow-[0_4px_16px_rgba(4,52,44,0.22)] hover:bg-[#03261F] transition mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SendrixLoader variant="dots" size="sm" label="Creating account" />
                  Creating account...
                </span>
              ) : (
                submitLabel
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5F5E5A]">
            Already have an account? <Link href="/login" className="text-[#04342C] font-semibold underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
