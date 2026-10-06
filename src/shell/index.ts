/**
 * shell — Module #7 interface surface.
 *
 * The composition root: `App` provides repositories (ADR 0038), a router (ADR 0035), and the
 * layout that wires the other six modules together.
 */
export { App } from './App'
export { RepositoriesProvider } from './RepositoriesProvider'
export type { RepositoriesProviderProps } from './RepositoriesProvider'
export { useRepositories } from './use-repositories'
export { ThemeProvider } from './ThemeProvider'
export { useThemeContext } from './theme-context'
export { ThemeToggle } from './ThemeToggle'
export { resolveInitialTheme, parseTheme, THEME_STORAGE_KEY, THEME_ATTRIBUTE } from './theme'
export type { Theme } from './theme'
