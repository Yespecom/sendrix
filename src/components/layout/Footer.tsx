import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0e0e10] text-[#D3D1C7] py-16 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12 mb-8">
        <div className="col-span-1 md:col-span-2">
          <img src="/sendrix_icon.png" alt="Sendrix" className="h-8 w-8 mb-4" />
          <p className="text-[#888780] text-sm max-w-xs leading-relaxed">
            Create onboarding sequences that actually convert, in seconds. Built for solo founders and indie hackers.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-4">Product</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
            <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
            <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Company</h4>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-[#5F5E5A]">
        <p>© 2026 Sendrix. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Powered by YESP Corporation</p>
      </div>
    </footer>
  )
}
