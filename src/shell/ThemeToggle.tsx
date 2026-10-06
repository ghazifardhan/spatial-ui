/**
 * ThemeToggle — the light/dark switch in the left nav footer (ADR 0053).
 *
 * A real <button> (keyboard operable, focus ring from the global token) that shows the *current*
 * mode and flips it on click. It is presentational: the theme state + persistence live in
 * `useTheme` (shell concern), and it reports its state via `aria-pressed`.
 */

import { Moon, Sun } from 'lucide-react'
import { useThemeContext } from './theme-context'
import styles from './ThemeToggle.module.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={styles.toggle}
    >
      <span className={styles.icon} aria-hidden>
        {isDark ? <Moon size={15} strokeWidth={2.2} /> : <Sun size={15} strokeWidth={2.2} />}
      </span>
      <span className={styles.label}>{isDark ? 'Dark' : 'Light'} mode</span>
      <span className={`${styles.track} ${isDark ? styles.trackOn : ''}`} aria-hidden>
        <span className={`${styles.knob} ${isDark ? styles.knobOn : ''}`} />
      </span>
    </button>
  )
}
