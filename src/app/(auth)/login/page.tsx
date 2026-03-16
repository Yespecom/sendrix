'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import SendrixLoader from '@/components/SendrixLoader'
import SendrixBrand from '@/components/SendrixBrand'

// Simple SVG for Google
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export default function LoginPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleOAuth = async (provider: 'google') => {
    await signIn(provider, { callbackUrl: '/auth/post-login' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    })

    setIsLoading(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.ok) {
      router.push('/app/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex w-[46%] bg-[#0e0e10] p-16 flex-col justify-between border-r border-white/5 relative overflow-hidden">
        {/* Subtle grid texture background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 w-full">
          <div className="mb-16">
            <SendrixBrand theme="dark" />
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-12 text-white">
            Good to have you back.
          </h1>
          
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-[#888780] text-sm mb-1">Sent today</div>
              <div className="text-2xl font-bold text-white">842</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-[#888780] text-sm mb-1">Open rate</div>
              <div className="text-2xl font-bold text-[#1D9E75]">64%</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-[#888780] text-sm mb-1">New users</div>
              <div className="text-2xl font-bold text-white">+12</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-semibold text-[#888780] uppercase tracking-wider mb-4">Live Activity</div>
            {[
              { color: 'bg-[#1D9E75]', text: 'New signup enrolled in Welcome Sequence' },
              { color: 'bg-[#EF9F27]', text: 'Day 3 email scheduled for mark@example.com' },
              { color: 'bg-[#378ADD]', text: 'Sarah opened "How to get started"' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5">
                <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                <span className="text-[#D3D1C7] text-sm">{activity.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[54%] bg-[#F5F3EC] flex flex-col items-center relative py-16 px-8">
        {/* Back to home */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#5F5E5A] hover:text-[#04342C] transition-colors group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to home
          </Link>
        </div>
        <div className="max-w-md w-full my-auto flex flex-col justify-center flex-1">
          <h2 className="text-3xl font-bold text-[#0e0e10] mb-2">Sign in to your account</h2>
          <p className="text-[#5F5E5A] mb-8">Welcome back. Enter your details below.</p>
          
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

          {error && (
            <div className="bg-[#EF9F27]/10 border border-[#EF9F27] text-[#BA7517] px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0e0e10] mb-1">Email address</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => { setFormData({...formData, email: e.target.value}); setError(null); }}
                className="w-full py-2.5 px-3 rounded-lg border border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-1 focus:ring-[#04342C] transition-shadow"
                placeholder="jane@company.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-[#0e0e10]">Password</label>
                <Link href="/forgot-password" className="text-sm text-[#04342C] font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              
              <div className="relative">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => { setFormData({...formData, password: e.target.value}); setError(null); }}
                  className="w-full py-2.5 pl-3 pr-10 rounded-lg border border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-1 focus:ring-[#04342C] transition-shadow"
                  placeholder="Enter your password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888780] hover:text-[#0e0e10]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
              <input 
                type="checkbox" 
                id="rememberMe" 
                className="mt-1 rounded text-[#04342C] focus:ring-[#04342C] w-4 h-4 border-[#D3D1C7]"
                checked={formData.rememberMe}
                onChange={e => setFormData({...formData, rememberMe: e.target.checked})}
              />
              <label htmlFor="rememberMe" className="text-sm text-[#5F5E5A]">
                Remember me
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#04342C] text-white py-3 rounded-lg font-medium shadow-[0_4px_16px_rgba(4,52,44,0.22)] hover:bg-[#03261F] transition mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SendrixLoader variant="dots" size="sm" label="Signing in" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5F5E5A]">
            Don't have an account? <Link href="/signup" className="text-[#04342C] font-semibold underline">Sign up</Link>
          </p>
        </div>

        {/* Bottom nudge panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#E1F5EE] py-4 text-center border-t border-[#0F6E56]/20">
          <p className="text-[#04342C] text-sm font-medium">Free forever on Starter plan. No credit card required.</p>
        </div>
      </div>
    </div>
  )
}
