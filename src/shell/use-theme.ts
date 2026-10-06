/**
 * useTheme — the React binding for the theme model (ADR 0053).
 *
 * Interface:
 *   - `const { theme, toggleTheme, setTheme } = useTheme()` returns the current theme and setters.
 *   - The initial theme is resolved once from the stored explicit choice / OS preference, then
 *     applied to <html> so tokens cascade. Subsequent changes persist the choice and re-apply it.
 *
 * The hook owns only theme *state*; all visual change happens through the `data-theme` attribute +
 * CSS tokens (ADR 0049). Shell-only — no domain/scene/viewer imports.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyTheme,
  prefersLightScheme,
  readStoredTheme,
  resolveInitialTheme,
  writeStoredTheme,
  type Theme,
} from './theme'

export interface UseTheme {
  theme: Theme
  /** Flip between light and dark; persists the explicit choice. */
  toggleTheme: () => void
  /** Set an explicit theme; persists the choice. */
  setTheme: (theme: Theme) => void
}

export function useTheme(): UseTheme {
  // Resolve the initial theme lazily so the first render already reflects the effective theme
  // (matching what the pre-paint bootstrap script set, so there is no flash — ADR 0053).
  const [theme, setThemeState] = useState<Theme>(() =>
    resolveInitialTheme({ stored: readStoredTheme(), prefersLight: prefersLightScheme() }),
  )

  // Keep the DOM attribute in sync with state.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // If the user has NOT made an explicit choice, follow OS changes live. Once they choose, we stop
  // tracking the OS (their choice is authoritative and persisted).
  const hasExplicitChoice = useRef(readStoredTheme() !== null)
  useEffect(() => {
    if (hasExplicitChoice.current) return
    let media: MediaQueryList
    try {
      media = window.matchMedia('(prefers-color-scheme: light)')
    } catch {
      return
    }
    const onChange = (event: MediaQueryListEvent) => {
      // Ignore OS changes once the user has made an explicit choice.
      if (hasExplicitChoice.current) return
      setThemeState(event.matches ? 'light' : 'dark')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    hasExplicitChoice.current = true
    writeStoredTheme(next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    // Derive the next theme from the committed state value (not inside the updater) so the
    // persisted value and the ref mutation happen exactly once and in sync with the change.
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return { theme, toggleTheme, setTheme }
}
