'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SendrixLoader from '@/components/SendrixLoader'

export default function WaitlistCard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    // In a real app, save to waitlist table via POST /api/waitlist
    setTimeout(() => {
        setStatus('success')
        // Automatically pivot them to the signup after 1.5 seconds out of convenience, or they can just stay on confirmation.
        setTimeout(() => {
          router.push('/signup')
        }, 1500)
    }, 1000)
  }

  return (
    <div className="bg-white border-[1.5px] border-[#D3D1C7] rounded-[18px] p-[28px] max-w-xl w-full mx-auto shadow-card relative z-20">
      {status === 'success' ? (
        <div className="text-center py-4 text-[#04342C]">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="text-xl font-bold mb-1">Spot claimed!</h3>
          <p className="text-[#5F5E5A] text-sm">Redirecting to create account...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="w-full flex-1 py-3 px-4 rounded-xl border border-[#D3D1C7] focus:ring-2 focus:ring-[#04342C] focus:border-transparent outline-none transition text-[#0e0e10]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full sm:w-auto sm:min-w-[140px] bg-[#EF9F27] text-[#04342C] font-bold py-3 px-6 rounded-xl hover:bg-[#BA7517] hover:text-white transition shadow-sm flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <SendrixLoader variant="dots" size="sm" label="Joining waitlist" />
                Joining...
              </>
            ) : (
              'Join'
            )}
          </button>
        </form>
      )}
    </div>
  )
}
