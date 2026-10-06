/**
 * NavigationControls — the in-viewer navigation UI (ADR 0052).
 *
 * A compact control cluster (zoom in/out, pan pad, orbit arrows, reset) plus a one-line "how to
 * navigate" legend. It drives the viewer purely through the imperative handle (ADR 0021): the
 * buttons call `zoomBy` / `panBy` / `orbitBy` / `resetView`, so navigation state stays out of React
 * (ADR 0012) and this component owns no camera state.
 *
 * Styled with CSS Modules + tokens (ADR 0049, 0050).
 */

import type { RefObject } from 'react'
import type { ViewerHandle } from '../viewer'
import styles from './NavigationControls.module.css'

interface NavigationControlsProps {
  viewerRef: RefObject<ViewerHandle | null>
  /** Whether to show the always-visible keyboard/mouse legend. Default true. */
  showLegend?: boolean
}

export function NavigationControls({ viewerRef, showLegend = true }: NavigationControlsProps) {
  const call = (fn: (v: ViewerHandle) => void) => () => {
    const viewer = viewerRef.current
    if (viewer) fn(viewer)
  }

  return (
    <div className={styles.wrap}>
      {showLegend && <NavigationLegend />}

      <div className={styles.cluster} role="group" aria-label="3D navigation">
        <div className={styles.pad}>
          <NavButton label="Orbit up" onClick={call((v) => v.orbitBy(0, -1))}>
            <Chevron dir="up" />
          </NavButton>
          <div className={styles.padMiddle}>
            <NavButton label="Pan left" onClick={call((v) => v.panBy(-0.12, 0))}>
              <Chevron dir="left" />
            </NavButton>
            <NavButton
              label="Reset view"
              onClick={call((v) => v.resetView())}
              variant="center"
            >
              <span aria-hidden>⟲</span>
            </NavButton>
            <NavButton label="Pan right" onClick={call((v) => v.panBy(0.12, 0))}>
              <Chevron dir="right" />
            </NavButton>
          </div>
          <NavButton label="Orbit down" onClick={call((v) => v.orbitBy(0, 1))}>
            <Chevron dir="down" />
          </NavButton>
        </div>

        <div className={styles.zoomColumn} role="group" aria-label="Zoom">
          <NavButton label="Zoom in" onClick={call((v) => v.zoomBy(1))}>
            <span aria-hidden>＋</span>
          </NavButton>
          <NavButton label="Zoom out" onClick={call((v) => v.zoomBy(-1))}>
            <span aria-hidden>－</span>
          </NavButton>
        </div>
      </div>
    </div>
  )
}

function NavButton({
  label,
  onClick,
  children,
  variant,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  variant?: 'center'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={variant === 'center' ? `${styles.btn} ${styles.btnCenter}` : styles.btn}
    >
      {children}
    </button>
  )
}

/** The persistent "how to navigate" hint (ADR 0052). */
function NavigationLegend() {
  return (
    <div className={styles.legend} aria-label="How to navigate">
      <span className={styles.legendItem}>
        <DragIcon /> Drag to orbit
      </span>
      <span className={styles.legendItem}>
        <ScrollIcon /> Scroll to zoom
      </span>
      <span className={styles.legendItem}>
        <span className={styles.key}>⇧</span>
        <span className={styles.key}>Drag</span> / right-drag to pan
      </span>
    </div>
  )
}

type Dir = 'up' | 'down' | 'left' | 'right'

/** A tiny chevron drawn as an inline SVG rotated per direction. */
function Chevron({ dir }: { dir: Dir }) {
  const rotation: Record<Dir, number> = { up: 0, right: 90, down: 180, left: 270 }
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden
      style={{ transform: `rotate(${rotation[dir]}deg)` }}
    >
      <path
        d="M6 15l6-6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DragIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
      <path
        d="M12 3v18M3 12h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
      <rect
        x="8"
        y="3"
        width="8"
        height="18"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M12 7v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
