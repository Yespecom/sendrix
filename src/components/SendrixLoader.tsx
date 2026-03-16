'use client'

import { CSSProperties } from 'react'
import styles from './SendrixLoader.module.css'

type LoaderSize = 'sm' | 'md' | 'lg'
type LoaderTone = 'light' | 'dark'
type LoaderVariant = 'full' | 'dots'

type SendrixLoaderProps = {
  label?: string
  size?: LoaderSize
  tone?: LoaderTone
  variant?: LoaderVariant
  className?: string
  hideLabel?: boolean
}

const SCALE_BY_SIZE: Record<LoaderSize, number> = {
  sm: 0.72,
  md: 1,
  lg: 1.15,
}

const LABEL_COLOR_BY_TONE: Record<LoaderTone, string> = {
  light: '#5F5E5A',
  dark: '#E8E6E0',
}

function combine(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export default function SendrixLoader({
  label = 'Loading...',
  size = 'md',
  tone = 'light',
  variant = 'full',
  className,
  hideLabel = false,
}: SendrixLoaderProps) {
  const style = {
    ['--loader-scale' as string]: String(SCALE_BY_SIZE[size]),
    ['--loader-label-color' as string]: LABEL_COLOR_BY_TONE[tone],
  } as CSSProperties

  if (variant === 'dots') {
    return (
      <span
        className={combine(styles.dotsOnly, className)}
        style={style}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <span className={combine(styles.dot, styles.dot1)} />
        <span className={combine(styles.dot, styles.dot2)} />
        <span className={combine(styles.dot, styles.dot3)} />
      </span>
    )
  }

  return (
    <div
      className={combine(styles.root, className)}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={styles.trackShell}>
        <div className={styles.track}>
          <div className={styles.trail} />
          <div className={styles.plane}>
            <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="200" height="200" rx="52" fill="#E8E6E0" />
              <polygon points="53,138 53,62 150,100" fill="#04342C" />
              <polygon points="53,62 150,100 53,100" fill="#085041" />
              <polygon points="53,138 102,100 53,118" fill="#EF9F27" />
              <polygon points="53,138 53,110 86,100" fill="#E8E6E0" />
            </svg>
          </div>
        </div>
      </div>
      <div className={styles.dots}>
        <div className={combine(styles.dot, styles.dot1)} />
        <div className={combine(styles.dot, styles.dot2)} />
        <div className={combine(styles.dot, styles.dot3)} />
      </div>
      {!hideLabel && <span className={styles.label}>{label}</span>}
    </div>
  )
}
