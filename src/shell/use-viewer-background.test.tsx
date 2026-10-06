import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { THEME_ATTRIBUTE } from './theme'
import { useViewerBackground } from './use-viewer-background'

function Probe() {
  const background = useViewerBackground()
  return <span data-testid="bg">{background}</span>
}

afterEach(() => {
  vi.restoreAllMocks()
  document.documentElement.removeAttribute(THEME_ATTRIBUTE)
  document.documentElement.style.removeProperty('--viewer-bg')
})

describe('useViewerBackground', () => {
  it('reads the --viewer-bg token from the document root', () => {
    document.documentElement.style.setProperty('--viewer-bg', '#123456')
    render(<Probe />)
    expect(screen.getByTestId('bg')).toHaveTextContent('#123456')
  })

  it('re-reads the token when the theme attribute changes', async () => {
    document.documentElement.style.setProperty('--viewer-bg', '#aabbcc')
    render(<Probe />)
    expect(screen.getByTestId('bg')).toHaveTextContent('#aabbcc')

    // Simulate a theme switch updating the token, then flipping the attribute.
    await act(async () => {
      document.documentElement.style.setProperty('--viewer-bg', '#ddeeff')
      document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light')
      // MutationObserver callbacks are async; yield a microtask turn.
      await Promise.resolve()
    })

    expect(screen.getByTestId('bg')).toHaveTextContent('#ddeeff')
  })
})
