'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSession } from 'next-auth/react'
import SendrixLoader from '@/components/SendrixLoader'

export default function WelcomePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [productName, setProductName] = useState('')
  const [isFoundingMember, setIsFoundingMember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function getUserData() {
      const session = await getSession()
      const user = session?.user as any
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('founding_member')
          .eq('id', user.id)
          .single()
        
        if (data?.founding_member) {
          setIsFoundingMember(true)
        }
      }
    }
    getUserData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (productName.length < 2) return
    
    setIsLoading(true)
    setError('')

    const session = await getSession()
    const user = session?.user as any
    if (!user) {
      setIsLoading(false)
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName })
      })
      const payload = await res.json()

      if (!res.ok) {
        setError(payload.error || 'Unable to create workspace right now.')
        return
      }

      if (payload.product?.id) {
        localStorage.setItem('sendrix_current_product_id', payload.product.id)
      }
      router.push('/workspace-setup/brief')
    } catch (err) {
      console.error('Workspace creation failed:', err)
      setError('Unable to create workspace right now.')
    } finally {
      setIsLoading(false)
    }
  }

  const chips = ['Invoice tool', 'Project tracker', 'AI writing app', 'Analytics dashboard']

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {isFoundingMember && (
        <div className="bg-[#EF9F27]/10 text-[#EF9F27] border border-[#EF9F27]/30 px-4 py-1.5 rounded-full font-medium text-sm mb-8 inline-flex items-center gap-2">
          <span>Founding Member</span>
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-extrabold text-[#0e0e10] mb-12 tracking-tight">What are you building?</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative mb-6">
          <input 
            type="text" 
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full text-2xl md:text-3xl font-medium py-6 px-8 rounded-[14px] border-2 border-[#D3D1C7] bg-white text-[#0e0e10] focus:outline-none focus:border-[#04342C] focus:ring-4 focus:ring-[#E1F5EE] transition-all shadow-sm"
            placeholder="e.g. Invoicely"
            autoFocus
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {chips.map(chip => (
            <button
              key={chip}
              type="button"
              onClick={() => setProductName(chip)}
              className="px-4 py-2 rounded-full border border-[#D3D1C7] bg-white text-[#5F5E5A] hover:bg-[#E1F5EE] hover:text-[#04342C] hover:border-[#0F6E56]/30 transition-colors text-sm font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        <button 
          type="submit"
          disabled={productName.length < 2 || isLoading}
          className="bg-[#04342C] text-white px-12 py-4 rounded-full font-semibold text-lg shadow-[0_4px_16px_rgba(4,52,44,0.22)] hover:bg-[#03261F] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <SendrixLoader variant="dots" size="sm" label="Saving workspace" />
              Saving...
            </span>
          ) : (
            'Continue'
          )}{' '}
          {!isLoading && <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>}
        </button>

        {error && (
          <p className="mt-4 text-sm font-medium text-[#D85A30]">{error}</p>
        )}
      </form>
    </div>
  )
}
