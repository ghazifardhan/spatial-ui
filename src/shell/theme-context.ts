/**
 * theme-context — the React context object + reader hook for the shell theme (ADR 0053).
 *
 * Kept separate from `ThemeProvider.tsx` so the provider file exports only a component (Fast
 * Refresh) and consumers import the hook from here.
 */

import { createContext, useContext } from 'react'
import type { UseTheme } from './use-theme'

export const ThemeContext = createContext<UseTheme | null>(null)

/** Read the shell theme. Throws when used outside a `ThemeProvider` (a wiring bug). */
export function useThemeContext(): UseTheme {
  const value = useContext(ThemeContext)
  if (!value) {
    throw new Error('useThemeContext must be used within a <ThemeProvider>')
  }
  return value
}
