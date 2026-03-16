import SendrixGlyph from './SendrixGlyph'
import styles from './SequenceOrbitLoader.module.css'

type SequenceOrbitLoaderProps = {
  label?: string
  className?: string
}

function combine(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

const ENVELOPES = [styles.env1, styles.env2, styles.env3, styles.env4]

export default function SequenceOrbitLoader({
  label = 'Sending sequence',
  className,
}: SequenceOrbitLoaderProps) {
  return (
    <div
      className={combine(styles.scene, className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={styles.orbitWrap}>
        <div className={styles.orbitRing} />

        {ENVELOPES.map((envelopeClass, index) => (
          <div key={index} className={combine(styles.env, envelopeClass)} aria-hidden="true">
            <svg viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="22" height="16" rx="2.5" fill="#04342C" />
              <path d="M1 2l10 7 10-7" stroke="#EF9F27" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        ))}

        <div className={styles.centerIcon}>
          <SendrixGlyph size={72} />
        </div>
      </div>

      <div className={styles.barWrap} aria-hidden="true">
        <div className={styles.barFill} />
      </div>

      <div className={styles.status}>
        {label}
        <div className={styles.dotPulse} aria-hidden="true">
          <div className={styles.dp} />
          <div className={styles.dp} />
          <div className={styles.dp} />
        </div>
      </div>
    </div>
  )
}
