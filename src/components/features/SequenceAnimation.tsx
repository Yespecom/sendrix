'use client'

import React from 'react'

const SequenceAnimation = () => {
  const steps = ['Welcome', 'Activation', 'Value', 'Social Proof', 'Upgrade']
  return (
    <div className="relative w-full aspect-square md:aspect-video bg-[#04342C] rounded-[32px] overflow-hidden flex items-center justify-center p-8">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="relative w-full max-w-2xl flex items-center justify-between gap-2 z-10">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#EF9F27] to-transparent animate-move-line"></div>
        </div>

        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-center group">
            <div 
              className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative z-20 group-hover:border-[#1D9E75] transition-colors"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse"></div>
              {/* Pulse Ring */}
              <div className="absolute inset-0 rounded-2xl border border-[#1D9E75] opacity-0 animate-ping-slow"></div>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">{step}</span>
            
            {/* Animation Particle */}
            <div className="absolute top-1/2 -left-4 w-2 h-2 bg-[#EF9F27] rounded-full blur-[2px] opacity-0 animate-data-particle" style={{ animationDelay: `${i * 1.5}s` }}></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes moveLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes pingSlow {
          0% { transform: scale(1); opacity: 0.5; }
          70%, 100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes dataParticle {
          0% { transform: translate(-20px, -50%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(100px, -50%); opacity: 0; }
        }
        .animate-move-line {
          animation: moveLine 3s linear infinite;
        }
        .animate-ping-slow {
          animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-data-particle {
          animation: dataParticle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default SequenceAnimation
