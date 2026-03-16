'use client'

import { usePathname } from 'next/navigation'

export default function WorkspaceSetupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const steps = [
    { num: 1, path: '/workspace-setup/brief', label: 'Brief' },
    { num: 2, path: '/workspace-setup/generating', label: 'Generating' },
    { num: 3, path: '/workspace-setup/reveal', label: 'Preview' },
  ]

  const currentStep = steps.find(s => pathname.includes(s.path))?.num || 1

  return (
    <div className="min-h-screen bg-[#F5F3EC] text-[#0e0e10] flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-[#F5F3EC]/80 backdrop-blur-md border-b border-[#D3D1C7]/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            <img src="/sendrix_icon.png" alt="Sendrix" className="h-6 w-6" />
            <div className="h-4 w-px bg-[#D3D1C7]" />
            <span className="text-sm font-semibold text-[#5F5E5A]">Workspace Setup</span>
          </div>

          {/* Centre: step pills */}
          <div className="flex items-center gap-1.5">
            {steps.map(step => (
              <div
                key={step.num}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentStep === step.num
                    ? 'bg-[#04342C] text-white shadow-sm'
                    : currentStep > step.num
                    ? 'bg-[#E1F5EE] text-[#0F6E56]'
                    : 'text-[#888780]'
                }`}
              >
                {currentStep > step.num && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {step.label}
              </div>
            ))}
          </div>

          <div className="w-32" />
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
