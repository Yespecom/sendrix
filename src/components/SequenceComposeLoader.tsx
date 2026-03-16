import styles from './SequenceComposeLoader.module.css'

type SequenceComposeLoaderProps = {
  message?: string
  className?: string
}

function combine(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export default function SequenceComposeLoader({
  message = 'AI is writing your sequence...',
  className,
}: SequenceComposeLoaderProps) {
  return (
    <div
      className={combine(styles.scene, className)}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className={styles.stack}>
        <div className={combine(styles.card, styles.card3)} />
        <div className={combine(styles.card, styles.card2)} />
        <div className={combine(styles.card, styles.card1)}>
          <div className={styles.cardHeader}>
            <div className={styles.avatar}>
              <svg viewBox="0 0 200 200" className={styles.avatarIcon} aria-hidden="true">
                <polygon points="53,138 53,62 150,100" fill="#F8F7F4" />
                <polygon points="53,62 150,100 53,100" fill="rgba(255,255,255,0.5)" />
                <polygon points="53,138 102,100 53,118" fill="#EF9F27" />
                <polygon points="53,138 53,110 86,100" fill="#04342C" />
              </svg>
            </div>
            <div className={styles.avatarLines}>
              <div className={combine(styles.line, styles.lineDark)} />
              <div className={combine(styles.line, styles.lineShort)} />
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={combine(styles.bodyLine, styles.w100)} />
            <div className={combine(styles.bodyLine, styles.w80)} />
            <div className={combine(styles.bodyLine, styles.w60)} />
          </div>

          <div className={styles.cardFooter}>
            <div className={styles.sendBtn}>
              <span className={styles.sendBtnText}>Send</span>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M2 8h12M9 3l5 5-5 5"
                  stroke="#EF9F27"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.typingRow}>
        <div className={styles.typedText}>{message}</div>
        <div className={styles.cursor} aria-hidden="true" />
      </div>

      <div className={styles.counterRow} aria-hidden="true">
        <div className={styles.stat}>
          <span className={styles.statNum}>247</span>
          <span className={styles.statLabel}>Emails sent</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={combine(styles.statNum, styles.statNumAmber)}>68%</span>
          <span className={styles.statLabel}>Open rate</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stat}>
          <span className={styles.statNum}>12</span>
          <span className={styles.statLabel}>Replies</span>
        </div>
      </div>
    </div>
  )
}
