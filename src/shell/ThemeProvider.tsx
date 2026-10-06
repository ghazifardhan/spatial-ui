/**
 * ThemeProvider — supplies the single theme state to the shell (ADR 0053).
 *
 * The theme is one piece of state with side effects (DOM attribute + localStorage), so it lives in a
 * context rather than being re-created per consumer. `useThemeContext()` reads it; `ThemeProvider`
 * owns it. The provider is mounted once near the shell root (App).
 */

import type { ReactNode } from 'react'
import { ThemeContext } from './theme-context'
import { useTheme } from './use-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme()
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
