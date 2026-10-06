/**
 * useViewerBackground — resolves the CSS token `--viewer-bg` to a concrete colour string for the
 * 3D canvas (ADR 0053).
 *
 * The viewer stays theme-agnostic: it already accepts a plain `background` colour prop (ADR 0024).
 * The shell is what knows about themes, so the shell reads the token and passes it in. This keeps
 * the theme concern on the shell side of the viewer seam (no theme state leaks into the viewer).
 *
 * It reads the computed value from <html> (where `data-theme` lives) and re-reads whenever the
 * theme attribute changes, via a MutationObserver, so the canvas backdrop follows the toggle.
 */

import { useEffect, useState } from 'react'
import { THEME_ATTRIBUTE } from './theme'

const VIEWER_BG_FALLBACK = '#eef1f4'

/** The token name whose value the canvas backdrop should track. */
const VIEWER_BG_TOKEN = '--viewer-bg'

function readViewerBackground(): string {
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(VIEWER_BG_TOKEN)
      .trim()
    return value || VIEWER_BG_FALLBACK
  } catch {
    return VIEWER_BG_FALLBACK
  }
}

export function useViewerBackground(): string {
  const [background, setBackground] = useState(readViewerBackground)

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setBackground(readViewerBackground()))
    observer.observe(root, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] })
    return () => observer.disconnect()
  }, [])

  return background
}
