'use client'

import { useEffect, useState } from 'react'
import SendrixGlyph from './SendrixGlyph'
import styles from './SequenceCreationAiLoader.module.css'

type SequenceCreationAiLoaderProps = {
  label?: string
  className?: string
}

const PHRASES = [
  'Analysing your leads...',
  'Writing subject lines...',
  'Personalising each email...',
  'Crafting follow-ups...',
  'Optimising for replies...',
  'Almost ready...',
]

function combine(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export default function SequenceCreationAiLoader({
  label = 'Generating your sequence',
  className,
}: SequenceCreationAiLoaderProps) {
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    let pause = 0
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      if (pause > 0) {
        pause -= 1
        timeoutId = setTimeout(tick, 40)
        return
      }

      const phrase = PHRASES[phraseIndex]

      if (!deleting) {
        charIndex += 1
        setTypedText(phrase.slice(0, charIndex))
        if (charIndex === phrase.length) {
          deleting = true
          pause = 55
        }
        timeoutId = setTimeout(tick, 55)
        return
      }

      charIndex -= 1
      setTypedText(phrase.slice(0, charIndex))
      if (charIndex === 0) {
        deleting = false
        phraseIndex = (phraseIndex + 1) % PHRASES.length
        pause = 12
      }
      timeoutId = setTimeout(tick, 28)
    }

    tick()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className={combine(styles.scene, className)} role="status" aria-live="polite" aria-label={label}>
      <div className={styles.iconWrap} aria-hidden="true">
        <div className={styles.ring} />
        <div className={styles.ring2} />
        <div className={styles.iconCenter}>
          <SendrixGlyph size={38} />
        </div>
      </div>

      <div className={styles.textWrap}>
        <span className={styles.label}>{label}</span>
        <span className={styles.typing}>
          {typedText}
          <span className={styles.cursor} />
        </span>
      </div>
    </div>
  )
}
