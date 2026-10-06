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
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Move,
  Mouse,
  Plus,
  RotateCcw,
} from 'lucide-react'
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
            <ChevronUp size={14} strokeWidth={2.4} />
          </NavButton>
          <div className={styles.padMiddle}>
            <NavButton label="Pan left" onClick={call((v) => v.panBy(-0.12, 0))}>
              <ChevronLeft size={14} strokeWidth={2.4} />
            </NavButton>
            <NavButton label="Reset view" onClick={call((v) => v.resetView())} variant="center">
              <RotateCcw size={15} strokeWidth={2.2} />
            </NavButton>
            <NavButton label="Pan right" onClick={call((v) => v.panBy(0.12, 0))}>
              <ChevronRight size={14} strokeWidth={2.4} />
            </NavButton>
          </div>
          <NavButton label="Orbit down" onClick={call((v) => v.orbitBy(0, 1))}>
            <ChevronDown size={14} strokeWidth={2.4} />
          </NavButton>
        </div>

        <div className={styles.zoomColumn} role="group" aria-label="Zoom">
          <NavButton label="Zoom in" onClick={call((v) => v.zoomBy(1))}>
            <Plus size={15} strokeWidth={2.4} />
          </NavButton>
          <NavButton label="Zoom out" onClick={call((v) => v.zoomBy(-1))}>
            <Minus size={15} strokeWidth={2.4} />
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
        <Move size={13} strokeWidth={1.8} aria-hidden /> Drag to orbit
      </span>
      <span className={styles.legendItem}>
        <Mouse size={13} strokeWidth={1.8} aria-hidden /> Scroll to zoom
      </span>
      <span className={styles.legendItem}>
        <span className={styles.key}>Shift</span>
        <span className={styles.key}>Drag</span> / right-drag to pan
      </span>
    </div>
  )
}
