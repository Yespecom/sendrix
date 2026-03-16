type SendrixGlyphProps = {
  size?: number
  className?: string
}

export default function SendrixGlyph({ size = 72, className }: SendrixGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="200" height="200" rx="52" fill="#E8E6E0" />
      <polygon points="53,138 53,62 150,100" fill="#04342C" />
      <polygon points="53,62 150,100 53,100" fill="#085041" />
      <polygon points="53,138 102,100 53,118" fill="#EF9F27" />
      <polygon points="53,138 53,110 86,100" fill="#E8E6E0" />
    </svg>
  )
}
