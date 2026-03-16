import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: '404 — Page Not Found | Sendrix',
}

export default function NotFound() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navIcon}>
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <clipPath id="nc">
                <rect width="32" height="32" rx="9" />
              </clipPath>
            </defs>
            <rect width="32" height="32" rx="9" fill="#E8E6E0" />
            <polygon points="6,26 6,6 28,16" fill="#04342C" clipPath="url(#nc)" />
            <polygon points="6,6 28,16 6,16" fill="#085041" clipPath="url(#nc)" />
            <polygon points="6,26 16,16 6,21" fill="#EF9F27" clipPath="url(#nc)" />
            <polygon points="6,26 6,18 12,16" fill="#E8E6E0" clipPath="url(#nc)" />
          </svg>
        </div>
        <div className={styles.navBrand}>
          Sendrix<span>.</span>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.planeWrap}>
          <div className={styles.fourOFour}>404</div>
          <div className={styles.planeIcon}>
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <clipPath id="pc">
                  <rect width="72" height="72" rx="20" />
                </clipPath>
              </defs>
              <polygon points="12,56 12,16 60,36" fill="white" clipPath="url(#pc)" />
              <polygon points="12,16 60,36 12,36" fill="#085041" clipPath="url(#pc)" />
              <polygon points="12,56 36,36 12,46" fill="#EF9F27" clipPath="url(#pc)" />
              <polygon points="12,56 12,40 24,36" fill="#04342C" clipPath="url(#pc)" />
            </svg>
          </div>
        </div>

        <div className={styles.crashLine} />

        <h1 className={styles.title}>
          This page got lost in transit<span className={styles.dot} />
        </h1>

        <p className={styles.subtitle}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Let&apos;s get your onboarding emails back on track.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            ← Back to home
          </Link>
          <Link href="/blog" className={styles.btnSecondary}>
            Read the blog
          </Link>
        </div>

        <p className={styles.hint}>sendrix.in · AI email sequences</p>
      </main>
    </div>
  )
}
