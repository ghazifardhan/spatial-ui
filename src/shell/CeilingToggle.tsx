/**
 * CeilingToggle — the overlay chip that shows/hides ceilings (ADR 0048). Presented inside the
 * viewer overlay slot; controlled by the shell. Styled with CSS Modules (ADR 0049).
 */

import styles from './CeilingToggle.module.css'

interface CeilingToggleProps {
  show: boolean
  onChange: (show: boolean) => void
}

export function CeilingToggle({ show, onChange }: CeilingToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!show)}
      aria-pressed={show}
      title={show ? 'Hide ceiling to see the interior' : 'Show ceiling'}
      className={styles.chip}
    >
      <span className={`${styles.track} ${show ? styles.trackOn : ''}`} aria-hidden>
        <span className={`${styles.knob} ${show ? styles.knobOn : ''}`} />
      </span>
      {show ? 'Ceiling on' : 'Ceiling off'}
    </button>
  )
}
