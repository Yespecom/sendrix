export type EmailDesignTemplateKey =
  | 'clean_minimal'
  | 'editorial_bold'
  | 'warm_editorial'

export type EmailDesignTemplate = {
  key: EmailDesignTemplateKey
  label: string
  description: string
}

export const EMAIL_DESIGN_TEMPLATES: EmailDesignTemplate[] = [
  { key: 'clean_minimal', label: 'Clean Minimal', description: 'Forest green header, generous white space, serif headline' },
  { key: 'editorial_bold', label: 'Editorial Bold', description: 'Dark mode, amber accents, high contrast — built for impact' },
  { key: 'warm_editorial', label: 'Warm Editorial', description: 'Cream background, amber gradient stripe, personal tone' }
]

type RenderOptions = {
  templateKey?: string
  subject: string
  body: string
  ctaText?: string
  ctaUrl?: string
  productName?: string
  dayIndex?: number
  senderName?: string
}

function escapeHtml(input: string): string {
  return (input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function bodyToHtml(body: string): string {
  const paragraphs = (body || '').split('\n')
  return paragraphs
    .map((line) => {
      if (!line.trim()) return '<div style="height:12px"></div>'
      return `<p style="margin:0 0 14px 0;line-height:1.75;">${escapeHtml(line)}</p>`
    })
    .join('')
}

export function renderEmailTemplateHtml(options: RenderOptions): string {
  const key = options.templateKey || 'clean_minimal'
  const safeSubject = escapeHtml(options.subject || '')
  const safeBody = bodyToHtml(options.body || '')
  const safeProduct = escapeHtml(options.productName || 'Sendrix')
  const safeCtaText = escapeHtml(options.ctaText || 'Get Started')
  const ctaUrl = options.ctaUrl || '#'
  const dayText = options.dayIndex !== undefined ? `Day ${options.dayIndex}` : ''
  const senderName = options.senderName || 'Founder'

  if (key === 'editorial_bold') {
    return `
<!DOCTYPE html>
<html>
<body style="background:#111; font-family: sans-serif; -webkit-font-smoothing: antialiased; margin:0; padding:40px 20px;">
  <div style="max-width:580px; margin:0 auto; background:#0e0e10; border-radius:8px; overflow:hidden; box-shadow:0 2px 24px rgba(0,0,0,.3);">
    <div style="padding:28px 36px 0;">
      <div style="background:#171717; border-radius:10px; padding:28px 28px 24px; margin-bottom:0;">
        <h2 style="font-size:26px; font-weight:700; color:#fff; line-height:1.2; letter-spacing:-.5px; margin:0;">${safeSubject}</h2>
      </div>
    </div>
    <div style="padding:24px 36px; color:#888; font-size:14px; line-height:1.75;">
      ${safeBody}
      <div style="margin:28px 0 0;">
        <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; background:#EF9F27; color:#0e0e10; padding:13px 24px; border-radius:8px; font-size:14px; font-weight:700; text-decoration:none;">${safeCtaText}</a>
      </div>
      <p style="font-size:13px; color:#555; margin-top:28px;">— ${senderName}, ${safeProduct}</p>
    </div>
    <div style="border-top:1px solid #1e1e1e; padding:18px 36px; font-size:11px; color:#444;">
      Sent by ${safeProduct}
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  if (key === 'warm_editorial') {
    return `
<!DOCTYPE html>
<html>
<body style="background:#ede9e1; font-family: sans-serif; margin:0; padding:40px 20px;">
  <div style="max-width:580px; margin:0 auto; background:#fffef9; border-radius:8px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,.07);">
    <div style="height:4px; background:linear-gradient(90deg,#EF9F27,#04342C);"></div>
    <div style="padding:28px 40px 20px; border-bottom:1px solid #f0ede6; font-weight:700;">${safeProduct}</div>
    <div style="padding:36px 40px;">
      <h2 style="font-size:28px; color:#0e0e10; letter-spacing:-.3px; line-height:1.2; margin:0 0 20px 0;">${safeSubject}</h2>
      <div style="font-size:15px; color:#5F5E5A; line-height:1.78;">
        ${safeBody}
      </div>
      <div style="background:#E1F5EE; border:1px solid #9FE1CB; border-radius:10px; padding:20px 22px; margin:24px 0;">
        <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="background:#04342C; color:#fff; padding:10px 20px; border-radius:7px; font-size:13px; font-weight:600; text-decoration:none; display:inline-block;">${safeCtaText}</a>
      </div>
      <p style="font-size:14px; color:#5F5E5A; margin-top:24px; border-top:1px solid #f0ede6; padding-top:20px;">— ${senderName}, ${safeProduct}</p>
    </div>
    <div style="background:#f5f3ec; border-top:1px solid #ede9e1; padding:16px 40px; font-size:11px; color:#bbb;">
      Sent by ${safeProduct}
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  // Clean Minimal (Default)
  return `
<!DOCTYPE html>
<html>
<body style="background:#f8f7f4; font-family: sans-serif; margin:0; padding:40px 20px;">
  <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="background:#04342C; padding:24px 32px; color:#fff; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:600; font-size:15px;">${safeProduct}</span>
    </div>
    <div style="padding:36px 40px;">
      <h2 style="font-size:28px; color:#0e0e10; line-height:1.15; margin:0 0 18px 0;">${safeSubject}</h2>
      <div style="width:32px; height:2px; background:#04342C; margin-bottom:20px;"></div>
      <div style="font-size:15px; color:#5F5E5A; line-height:1.75;">
        ${safeBody}
      </div>
      <div style="margin:28px 0;">
        <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="background:#04342C; color:#fff; padding:13px 28px; border-radius:8px; font-size:14px; font-weight:600; text-decoration:none; display:inline-block;">${safeCtaText}</a>
      </div>
      <p style="font-size:14px; color:#888; margin-top:32px;">— ${senderName}</p>
    </div>
    <div style="background:#f5f3ec; padding:20px 40px; border-top:1px solid #e8e5de; font-size:12px; color:#aaa;">
      Sent by ${safeProduct}
    </div>
  </div>
</body>
</html>
  `.trim()
}
