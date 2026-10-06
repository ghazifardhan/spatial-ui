/**
 * theme — the shell's theme model (ADR 0053).
 *
 * Interface (what a caller must know):
 *   - A theme is `'light' | 'dark'`. The DARK theme is the default (ADR 0050); light is an override.
 *   - `resolveInitialTheme({ stored, prefersLight })` is a **pure** function: an explicit stored
 *     choice always wins, otherwise the OS preference decides. It is the single place initial
 *     resolution is decided, so the pre-paint bootstrap and the React hook can never disagree.
 *   - `readStoredTheme()` / `writeStoredTheme()` are the only persistence points (localStorage,
 *     guarded for private-mode / disabled storage).
 *   - `applyTheme(theme, root)` sets `data-theme` on <html>; this is the only DOM write, so all
 *     styling flows from the attribute + tokens (ADR 0049).
 *
 * Theming is a **shell concern**: nothing here is imported by domain / scene-gen / viewer.
 */

export type Theme = 'light' | 'dark'

/** localStorage key holding the *explicit* user choice. Absent means "follow the OS". */
export const THEME_STORAGE_KEY = 'spatial-ui:theme'

/** The attribute that scopes the token overrides in tokens.css. */
export const THEME_ATTRIBUTE = 'data-theme'

/**
 * Resolve the initial theme. Pure: given whether the user has an explicit stored choice and
 * whether the OS prefers light, decide which theme to show. An explicit choice always wins.
 */
export function resolveInitialTheme(input: { stored: Theme | null; prefersLight: boolean }): Theme {
  if (input.stored === 'light' || input.stored === 'dark') return input.stored
  return input.prefersLight ? 'light' : 'dark'
}

/** Narrow an arbitrary string (e.g. from storage) to a Theme, or null when it isn't one. */
export function parseTheme(value: string | null | undefined): Theme | null {
  return value === 'light' || value === 'dark' ? value : null
}

/** Read the persisted explicit choice, tolerating storage being unavailable. */
export function readStoredTheme(): Theme | null {
  try {
    return parseTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return null
  }
}

/** Persist the explicit choice, tolerating storage being unavailable. */
export function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage disabled (private mode / quota) — the theme still applies for this session.
  }
}

/** Read the OS colour-scheme preference, defaulting to dark (the product default, ADR 0050). */
export function prefersLightScheme(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches
  } catch {
    return false
  }
}

/** Apply the theme to the document root via the `data-theme` attribute. */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.setAttribute(THEME_ATTRIBUTE, theme)
}
