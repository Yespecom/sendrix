import SendrixGlyph from './SendrixGlyph'
import styles from './LaunchPoster.module.css'

type LaunchPosterProps = {
  className?: string
}

function combine(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

function PosterGlyph({ className }: { className?: string }) {
  return <SendrixGlyph className={className} />
}

export default function LaunchPoster({ className }: LaunchPosterProps) {
  return (
    <div className={combine(styles.poster, className)} aria-label="Sendrix launch poster">
      <div className={combine(styles.deco, styles.deco1)}>
        <PosterGlyph />
      </div>
      <div className={combine(styles.deco, styles.deco2)}>
        <PosterGlyph />
      </div>
      <div className={combine(styles.deco, styles.deco3)}>
        <PosterGlyph />
      </div>

      <div className={styles.top}>
        <div className={styles.wordmark}>
          <SendrixGlyph className={styles.iconSm} />
          sendrix
        </div>
        <div className={styles.taglinePill}>AI email sequences</div>
      </div>

      <div className={styles.middle}>
        <p className={styles.problem}>
          <span>You spend hours writing emails.</span>
          <span>They get ignored. You start over.</span>
        </p>
        <div className={styles.arrowRow}>
          <div className={styles.line} />
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 8h12M9 3l5 5-5 5"
              stroke="#EF9F27"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className={styles.headline}>
          Send smarter.
          <br />
          <em>Close faster.</em>
        </h2>
      </div>

      <div className={styles.bottom}>
        <span className={styles.sub}>Coming soon</span>
        <span className={styles.domain}>sendrix.in</span>
      </div>

      <div className={styles.cornerRule} />
    </div>
  )
}
