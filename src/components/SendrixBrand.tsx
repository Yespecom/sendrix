import { useId } from 'react'

type SendrixBrandProps = {
  theme?: 'light' | 'dark'
  className?: string
}

function combine(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export default function SendrixBrand({ theme = 'light', className }: SendrixBrandProps) {
  const clipId = useId()

  return (
    <span className={combine('inline-flex items-center gap-2.5', className)}>
      <span className="w-8 h-8 rounded-[9px] bg-[#E8E6E0] overflow-hidden shrink-0 inline-flex">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
          <defs>
            <clipPath id={clipId}>
              <rect width="32" height="32" rx="9" />
            </clipPath>
          </defs>
          <rect width="32" height="32" rx="9" fill="#E8E6E0" />
          <polygon points="6,26 6,6 28,16" fill="#04342C" clipPath={`url(#${clipId})`} />
          <polygon points="6,6 28,16 6,16" fill="#085041" clipPath={`url(#${clipId})`} />
          <polygon points="6,26 16,16 6,21" fill="#EF9F27" clipPath={`url(#${clipId})`} />
          <polygon points="6,26 6,18 12,16" fill="#E8E6E0" clipPath={`url(#${clipId})`} />
        </svg>
      </span>
      <span className={combine('text-[18px] font-bold tracking-[-0.3px]', theme === 'dark' ? 'text-white/95' : 'text-[#0e0e10]')}>
        Sendrix<span className="text-[#EF9F27]">.</span>
      </span>
    </span>
  )
}
