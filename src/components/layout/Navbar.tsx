'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="w-full bg-[#F5F3EC] py-4 px-6 border-b border-[#D3D1C7] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[9px] bg-[#E8E6E0] overflow-hidden shrink-0">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
              <defs>
                <clipPath id="navbarLogoClip">
                  <rect width="32" height="32" rx="9" />
                </clipPath>
              </defs>
              <rect width="32" height="32" rx="9" fill="#E8E6E0" />
              <polygon points="6,26 6,6 28,16" fill="#04342C" clipPath="url(#navbarLogoClip)" />
              <polygon points="6,6 28,16 6,16" fill="#085041" clipPath="url(#navbarLogoClip)" />
              <polygon points="6,26 16,16 6,21" fill="#EF9F27" clipPath="url(#navbarLogoClip)" />
              <polygon points="6,26 6,18 12,16" fill="#E8E6E0" clipPath="url(#navbarLogoClip)" />
            </svg>
          </span>
          <span className="text-[18px] font-bold tracking-[-0.3px] text-[#0e0e10]">
            Sendrix<span className="text-[#EF9F27]">.</span>
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5F5E5A]">
          <Link href="/features" className="hover:text-[#0e0e10] transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-[#0e0e10] transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-[#0e0e10] transition-colors">Blog</Link>
          <Link href="/docs" className="hover:text-[#0e0e10] transition-colors">Docs</Link>
          
          {session ? (
            <Link 
              href="/app/dashboard" 
              className="px-5 py-2.5 rounded-xl bg-[#04342C] text-white hover:bg-[#03261F] transition shadow-btn"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-[#0e0e10] transition-colors">Sign in</Link>
              <Link 
                href="/signup" 
                className="px-5 py-2.5 rounded-xl bg-[#04342C] text-white hover:bg-[#03261F] transition shadow-btn"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="md:hidden p-2 text-[#0e0e10] hover:bg-[#E8E6E0] rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`
        md:hidden absolute top-full left-0 w-full bg-[#F5F3EC] border-b border-[#D3D1C7] transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="flex flex-col gap-4 p-6 text-base font-bold text-[#5F5E5A]">
          <Link href="/features" onClick={() => setIsOpen(false)} className="hover:text-[#0e0e10] py-2 border-b border-[#D3D1C7]/30">Features</Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} className="hover:text-[#0e0e10] py-2 border-b border-[#D3D1C7]/30">Pricing</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} className="hover:text-[#0e0e10] py-2 border-b border-[#D3D1C7]/30">Blog</Link>
          <Link href="/docs" onClick={() => setIsOpen(false)} className="hover:text-[#0e0e10] py-2 border-b border-[#D3D1C7]/30">Docs</Link>
          
          <div className="pt-4 flex flex-col gap-4">
            {session ? (
              <Link 
                href="/app/dashboard" 
                onClick={() => setIsOpen(false)}
                className="w-full py-4 rounded-2xl bg-[#04342C] text-white text-center font-black shadow-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)} 
                  className="w-full py-4 text-center border-2 border-[#D3D1C7] rounded-2xl"
                >
                  Sign in
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-2xl bg-[#04342C] text-white text-center font-black shadow-lg shadow-[#04342C]/20"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
