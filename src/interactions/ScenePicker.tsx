/**
 * ScenePicker — the R3F component that mounts a scene and turns pointer events into room
 * selection/hover callbacks (ADR 0026, 0028). Controlled: it owns no selection state.
 *
 * Interface (what a caller must know):
 *   - `<ScenePicker scene={group} selectedRoomId onSelect onHover onPointerRoom />` is rendered
 *     INSIDE the viewer's canvas (the viewer forwards its `children` here). It mounts the scene as
 *     a `<primitive>` with R3F pointer handlers, so `event.object` is the hit mesh.
 *   - `onSelect(roomId | null)` fires on click (empty space → `event.object` is the scene group;
 *     `resolveSelection` then returns null because the group carries no `roomId`).
 *   - `onHover(roomId | null)` fires on pointer move, driving the hover tint.
 *   - `onPointerRoom(roomId | null, clientX, clientY)` fires on the same moves with the room id AND
 *     the pointer's viewport coordinates, so the shell can anchor a tooltip without capturing its
 *     own DOM listeners (ADR 0055). It fires on **every** move (the caller needs live coordinates)
 *     and with `null` when the pointer leaves a room — whether onto empty space within the canvas
 *     or off the model entirely — so a cursor-following overlay always clears.
 *   - Selection highlighting is applied imperatively via the highlighter, driven by the
 *     `selectedRoomId` prop — the shell owns selection state (ADR 0025).
 *
 * The core decision is delegated to `resolveSelection` (ADR 0029).
 */

import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import { resolveSelection } from './resolve-selection'
import { createHighlighter } from './highlight'

export interface ScenePickerProps {
  /** The scene group to mount and pick against (same object the viewer frames). */
  scene: THREE.Group
  /** Currently selected room id, or null. Owned by the shell. */
  selectedRoomId: string | null
  /** Called on click with the room under the pointer, or null for empty space. */
  onSelect: (roomId: string | null) => void
  /** Called on pointer move with the room under the pointer, or null. */
  onHover?: (roomId: string | null) => void
  /**
   * Called on pointer move with the room under the pointer (or null) and the pointer's viewport
   * coordinates, so a shell overlay can follow the cursor (ADR 0055). Fires on every move.
   */
  onPointerRoom?: (roomId: string | null, clientX: number, clientY: number) => void
}

export function ScenePicker({
  scene,
  selectedRoomId,
  onSelect,
  onHover,
  onPointerRoom,
}: ScenePickerProps) {
  const highlighter = useMemo(() => createHighlighter(scene), [scene])
  const hoveredRef = useRef<string | null>(null)
  const invalidate = useThree((state) => state.invalidate)

  // Reflect the shell's selection as a persistent tint (ADR 0027).
  useEffect(() => {
    if (selectedRoomId) highlighter.highlight(selectedRoomId, 'select')
    else highlighter.clear()
    invalidate()
  }, [selectedRoomId, highlighter, invalidate])

  const applyHover = useCallback(
    (roomId: string | null) => {
      if (selectedRoomId) {
        highlighter.highlight(selectedRoomId, 'select')
        return
      }
      if (roomId) highlighter.highlight(roomId, 'hover')
      else highlighter.clear()
    },
    [selectedRoomId, highlighter],
  )

  const handlePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      const roomId = resolveSelection(event.object)
      // Tooltip anchoring needs live coordinates, so report every move before the tint's early-out.
      onPointerRoom?.(roomId, event.nativeEvent.clientX, event.nativeEvent.clientY)
      if (roomId === hoveredRef.current) return
      hoveredRef.current = roomId
      applyHover(roomId)
      onHover?.(roomId)
      invalidate()
    },
    [applyHover, onHover, onPointerRoom, invalidate],
  )

  const handlePointerOut = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      // Always tell the caller the pointer left a room, even if the hover tint is already clear:
      // the shell's tooltip must not linger when the cursor exits onto empty space or the canvas
      // edge (ADR 0055).
      onPointerRoom?.(null, event.nativeEvent.clientX, event.nativeEvent.clientY)
      if (hoveredRef.current === null) return
      hoveredRef.current = null
      applyHover(null)
      onHover?.(null)
      invalidate()
    },
    [applyHover, onHover, onPointerRoom, invalidate],
  )

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation()
      onSelect(resolveSelection(event.object))
    },
    [onSelect],
  )

  return (
    <primitive
      object={scene}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  )
}
