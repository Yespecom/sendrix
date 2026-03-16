'use client'

import { useEffect, useState } from 'react'
import SendrixLoader from '@/components/SendrixLoader'

export default function UnsubscribePage() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    // In a real app, hit an API to decode token and mark user as unsubscribed
    setTimeout(() => {
      setStatus('done')
    }, 1500)
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F3EC] flex flex-col justify-center items-center p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-[0_24px_64px_rgba(4,52,44,0.18)] max-w-sm w-full border border-[#D3D1C7]">
        {status === 'loading' ? (
          <div className="py-2">
            <SendrixLoader label="Processing your request..." size="sm" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#04342C] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-[#0e0e10] mb-2">Unsubscribed</h1>
            <p className="text-[#5F5E5A] text-sm">
              You have been successfully removed from this list. You won't receive any more emails from this sequence.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
