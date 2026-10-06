import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from './theme'

/** Install a controllable matchMedia, returning the change listener so tests can fire OS changes. */
function installMatchMedia(initialLight: boolean) {
  let listener: ((event: MediaQueryListEvent) => void) | null = null
  const mql = {
    matches: initialLight,
    media: '(prefers-color-scheme: light)',
    addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => {
      listener = cb
    },
    removeEventListener: () => {
      listener = null
    },
  } as unknown as MediaQueryList

  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))

  return {
    emitPreferenceChange(light: boolean) {
      listener?.({ matches: light } as MediaQueryListEvent)
    },
  }
}

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute(THEME_ATTRIBUTE)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  window.localStorage.clear()
  document.documentElement.removeAttribute(THEME_ATTRIBUTE)
})

describe('ThemeToggle', () => {
  it('defaults to dark when nothing is stored and the OS does not prefer light', () => {
    installMatchMedia(false)
    renderToggle()

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText(/dark mode/i)).toBeInTheDocument()
  })

  it('starts light when the OS prefers light and the user has not chosen', () => {
    installMatchMedia(true)
    renderToggle()

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light')
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByText(/light mode/i)).toBeInTheDocument()
  })

  it('prefers an explicit stored choice over the OS preference', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    installMatchMedia(false) // OS says dark, but the user chose light
    renderToggle()

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light')
  })

  it('toggles the theme, updates the attribute, and persists the choice', async () => {
    installMatchMedia(false) // start dark
    renderToggle()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark')

    await userEvent.click(screen.getByRole('button', { name: /switch to light theme/i }))

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('is keyboard operable', async () => {
    installMatchMedia(false)
    renderToggle()
    const button = screen.getByRole('button', { name: /switch to light theme/i })

    button.focus()
    await userEvent.keyboard('{Enter}')

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light')
  })

  it('follows live OS changes until the user makes an explicit choice', async () => {
    const media = installMatchMedia(false)
    renderToggle()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark')

    // OS flips to light — we should follow it (no explicit choice yet).
    media.emitPreferenceChange(true)
    expect(await screen.findByText(/light mode/i)).toBeInTheDocument()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light')
  })

  it('stops following OS changes after an explicit choice', async () => {
    const media = installMatchMedia(false)
    renderToggle()

    await userEvent.click(screen.getByRole('button', { name: /switch to light theme/i }))
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    // The OS offers dark, but the explicit choice must win.
    await act(async () => {
      media.emitPreferenceChange(false)
    })
    expect(screen.getByText(/light mode/i)).toBeInTheDocument()
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light')
  })
})
