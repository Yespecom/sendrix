'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SequenceCreationAiLoader from '@/components/SequenceCreationAiLoader'

const STEPS = [
  '✓ Reading your product brief...',
  '✓ Analysing your target user...',
  '✓ Writing your welcome email...',
  '✓ Building your activation sequence...',
  '✓ Finalising 6 emails...'
]

import { useSearchParams } from 'next/navigation'

export default function GeneratingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const requestSent = useRef(false)

  useEffect(() => {
    // Reveal steps sequentially
    const showSteps = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        setCurrentStepIndex(i)
        await new Promise(r => setTimeout(r, 1200)) // 1.2s per step
      }
    }
    
    showSteps()
    
    // Progress bar animation
    const startTime = Date.now()
    const DURATION = 6000 // 6 seconds
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const percent = Math.min((elapsed / DURATION) * 100, 99) // hang at 99% until complete
      setProgress(percent)
      
      if (percent < 99 && !error) {
        requestAnimationFrame(updateProgress)
      }
    }
    
    requestAnimationFrame(updateProgress)
    
  }, [error])

  useEffect(() => {
    // Make API call
    if (requestSent.current || !productId) return
    requestSent.current = true

    const generateSequence = async () => {
      try {
        const response = await fetch('/api/products/generate-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          const errorMessage =
            payload && typeof payload.error === 'string'
              ? payload.error
              : `Generation failed (${response.status})`
          throw new Error(errorMessage)
        }
        
        // Wait for progress animation to at least pass a bit if it finishes too fast
        setProgress(100)
        setTimeout(() => {
          router.push(`/workspace-setup/reveal?productId=${productId}`)
        }, 500)

      } catch (err: unknown) {
        console.error(err)
        const message = err instanceof Error ? err.message : 'Something went wrong — try again'
        if (message.toLowerCase().includes('quota')) {
          setError('AI is rate-limited right now. Please retry in about a minute.')
          return
        }
        setError('Something went wrong — try again')
      }
    }

    generateSequence()

  }, [router, productId])

  return (
    <div className="fixed inset-0 z-50 bg-[#04342C] flex flex-col items-center justify-center p-6 text-[#E1F5EE]">
      <div className="mb-14">
        <SequenceCreationAiLoader label="Generating your sequence" />
      </div>

      <div className="w-full max-w-sm space-y-4 mb-16 text-lg font-medium opacity-90 mx-auto min-h-[200px]">
        {STEPS.map((step, index) => (
          <div 
            key={index} 
            className={`transition-all duration-700 transform flex items-center ${
              index <= currentStepIndex 
                ? 'opacity-100 translate-y-0 text-[#E1F5EE]' 
                : 'opacity-0 translate-y-4 text-[#0F6E56]'
            }`}
          >
            {/* The checkmark gets colored golden/amber when completed */}
            <span className={`mr-3 ${index < currentStepIndex ? 'text-[#EF9F27]' : 'text-white/50'}`}>
              ✓
            </span>
            {step.replace('✓ ', '')}
          </div>
        ))}
      </div>

      {error ? (
        <div className="absolute bottom-24 flex flex-col items-center">
          <div className="text-[#D85A30] font-semibold bg-[#D85A30]/10 px-6 py-3 rounded-xl mb-4 text-center">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#E1F5EE] text-[#04342C] font-semibold rounded-full shadow-lg hover:bg-white transition"
          >
            Retry generation
          </button>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 w-full h-2 bg-[#03261F]">
          <div 
            className="h-full bg-[#EF9F27] shadow-[0_0_15px_rgba(239,159,39,0.8)] transition-all ease-linear"
            style={{ width: `${progress}%`, transitionDuration: progress === 100 ? '200ms' : '100ms' }}
          ></div>
        </div>
      )}
    </div>
  )
}
