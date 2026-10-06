import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  applyTheme,
  parseTheme,
  prefersLightScheme,
  readStoredTheme,
  resolveInitialTheme,
  writeStoredTheme,
} from './theme'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('resolveInitialTheme', () => {
  it('always honours an explicit stored choice, regardless of OS preference', () => {
    expect(resolveInitialTheme({ stored: 'light', prefersLight: false })).toBe('light')
    expect(resolveInitialTheme({ stored: 'dark', prefersLight: true })).toBe('dark')
  })

  it('falls back to the OS preference when there is no stored choice', () => {
    expect(resolveInitialTheme({ stored: null, prefersLight: true })).toBe('light')
    expect(resolveInitialTheme({ stored: null, prefersLight: false })).toBe('dark')
  })

  it('defaults to dark (the product default) when nothing is known', () => {
    expect(resolveInitialTheme({ stored: null, prefersLight: false })).toBe('dark')
  })
})

describe('parseTheme', () => {
  it('narrows known values and rejects everything else', () => {
    expect(parseTheme('light')).toBe('light')
    expect(parseTheme('dark')).toBe('dark')
    expect(parseTheme('system')).toBeNull()
    expect(parseTheme('')).toBeNull()
    expect(parseTheme(null)).toBeNull()
    expect(parseTheme(undefined)).toBeNull()
  })
})

describe('storage round-trip', () => {
  it('persists and reads back an explicit choice', () => {
    writeStoredTheme('light')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(readStoredTheme()).toBe('light')
  })

  it('returns null when nothing is stored', () => {
    expect(readStoredTheme()).toBeNull()
  })

  it('ignores a corrupt stored value', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse')
    expect(readStoredTheme()).toBeNull()
  })

  it('tolerates storage throwing (private mode)', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(readStoredTheme()).toBeNull()
    expect(() => writeStoredTheme('dark')).not.toThrow()
  })
})

describe('prefersLightScheme', () => {
  it('reflects the media query result', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true } as MediaQueryList),
    )
    expect(prefersLightScheme()).toBe(true)
  })

  it('defaults to false (dark) when matchMedia is unavailable', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => {
        throw new Error('no matchMedia')
      }),
    )
    expect(prefersLightScheme()).toBe(false)
  })
})

describe('applyTheme', () => {
  it('sets data-theme on the given root', () => {
    const root = document.createElement('div')
    applyTheme('light', root)
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('light')
    applyTheme('dark', root)
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark')
  })
})
