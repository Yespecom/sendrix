'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import SendrixLoader from '@/components/SendrixLoader'
import SendrixBrand from '@/components/SendrixBrand'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const { error: resetError } = await supabase.auth.updateUser({
      password: password
    })

    setIsLoading(false)

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  // Password strength basic check
  const pwLength = password.length
  let score = 0
  if (pwLength > 6) score += 1
  if (pwLength >= 8 && /[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1
  if (pwLength > 12) score += 1

  const strengthColors = ['bg-[#D85A30]', 'bg-[#EF9F27]', 'bg-[#1D9E75]', 'bg-[#04342C]']

  return (
    <div className="flex min-h-screen bg-[#F5F3EC]">
      <div className="w-full flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-sm border border-[#D3D1C7]">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <SendrixBrand />
            </div>
            <h3 className="text-xl font-bold text-[#0e0e10] mb-2">Reset your password</h3>
            <p className="text-[#5F5E5A] text-sm">Create a new, strong password below.</p>
          </div>

          {success ? (
            <div className="bg-[#E1F5EE] border border-[#1D9E75] text-[#04342C] p-6 rounded-xl text-center">
              <h4 className="font-bold mb-1 text-lg">Password updated</h4>
              <p className="text-sm">Your password has been successfully reset. Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0e0e10] mb-1">New password</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full py-2.5 px-3 pr-10 rounded-lg border border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-1 focus:ring-[#04342C] transition-shadow"
                    placeholder="Create a new password"
                    minLength={6}
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
                {password.length > 0 && (
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

              {error && <div className="text-[#D85A30] text-sm mt-2 font-medium">{error}</div>}

              <button 
                type="submit" 
                disabled={isLoading || password.length < 6}
                className="w-full bg-[#04342C] text-white py-3 rounded-lg font-bold shadow-btn hover:bg-[#03261F] transition mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <SendrixLoader variant="dots" size="sm" label="Updating password" />
                    Updating password...
                  </span>
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
