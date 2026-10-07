/**
 * RoomTooltip — a floating label that names the room under the pointer in the 3D view (ADR 0055).
 *
 * Interface (what a caller must know):
 *   - `<RoomTooltip label={roomName | null} x={clientX} y={clientY} />` is presented inside the
 *     viewer's overlay slot (ADR 0048), like the ceiling toggle and navigation controls.
 *   - `label === null` renders nothing; a non-null label renders a small, non-interactive chip
 *     anchored at the last pointer position (viewport coordinates), so it follows the cursor.
 *   - It is purely presentational — the shell owns the hovered-room state; this component never
 *     raycasts or touches the scene.
 */

import styles from './RoomTooltip.module.css'

interface RoomTooltipProps {
  /** Room name to show, or null to hide the tooltip. */
  label: string | null
  /** Pointer viewport x (from the picking callback), used as the tooltip's hotspot. */
  x: number
  /** Pointer viewport y (from the picking callback), used as the tooltip's hotspot. */
  y: number
}

/** Cursor offset so the chip sits beside the hotspot instead of under it. */
const OFFSET_X = 16
const OFFSET_Y = 18

export function RoomTooltip({ label, x, y }: RoomTooltipProps) {
  if (label === null) return null

  return (
    <div
      className={styles.tooltip}
      role="tooltip"
      style={{ left: x + OFFSET_X, top: y + OFFSET_Y }}
    >
      {label}
    </div>
  )
}
