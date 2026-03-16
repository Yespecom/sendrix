'use client'

import React, { useState } from 'react'
import { ChevronDown, Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: "How long does it take to set up Sendrix?",
    answer: "Setup takes under 10 minutes. Simply connect your Resend API key, answer 5 questions about your product, and our AI will generate a tailored 6-email onboarding sequence for you."
  },
  {
    question: "Do I need a Resend account to use Sendrix?",
    answer: "Yes, Sendrix is built to work seamlessly with Resend. You'll need a Resend account and an API key with sending permissions to automate your emails."
  },
  {
    question: "What exactly does the AI write?",
    answer: "Our AI generates a complete 6-email journey: 1. Welcome & Hook, 2. Activation Nudge, 3. Value Deep Dive, 4. Social Proof, 5. Friction Remover, and 6. Upgrade Nudge. Each email is written based on your specific product value proposition."
  },
  {
    question: "Can I manage multiple products?",
    answer: "Absolutely. With our Founding Member and Pro plans, you can create separate workspaces for different products or client projects, each with its own sequences and settings."
  },
  {
    question: "What happens after the AI generates the emails?",
    answer: "You can review and edit all generated emails in our sleek editor. Once you're happy, you can trigger the entire sequence via a simple webhook from your application."
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 px-6 bg-white border-t border-[#D3D1C7]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0e0e10] mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-[#5F5E5A]">Everything you need to know about Sendrix and SaaS onboarding.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="group border border-[#D3D1C7] rounded-[24px] overflow-hidden transition-all hover:border-[#1D9E75] bg-[#F5F3EC]/30"
            >
              <button
                onClick={() => setOpenIndex(index === openIndex ? null : index)}
                className="w-full px-6 md:px-8 py-5 md:py-6 text-left flex items-center justify-between gap-4"
              >
                <span className="text-base md:text-lg font-bold text-[#0e0e10]">{faq.question}</span>
                <div className={`shrink-0 w-8 h-8 rounded-full border border-[#D3D1C7] flex items-center justify-center transition-transform duration-300 ${openIndex === index ? 'rotate-180 bg-[#04342C] border-transparent text-white' : 'text-[#888780]'}`}>
                  <ChevronDown size={18} />
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 md:px-8 pb-6 md:pb-8 text-[#5F5E5A] leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-[#5F5E5A] mb-4 text-sm font-medium">Still have questions?</p>
          <a 
            href="mailto:support@sendrix.in" 
            className="inline-flex items-center gap-2 text-[#0F6E56] font-bold hover:underline"
          >
            Contact our team <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
