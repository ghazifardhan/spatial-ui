/**
 * ScenePicker — the R3F component that mounts a scene and turns pointer events into room
 * selection/hover callbacks (ADR 0026, 0028). Controlled: it owns no selection state.
 *
 * Interface (what a caller must know):
 *   - `<ScenePicker scene={group} selectedRoomId onSelect onHover />` is rendered INSIDE the viewer's
 *     canvas (the viewer forwards its `children` here). It mounts the scene as a `<primitive>` with
 *     R3F pointer handlers, so `event.object` is the hit mesh.
 *   - `onSelect(roomId | null)` fires on click (empty space → `event.object` is the scene group;
 *     `resolveSelection` then returns null because the group carries no `roomId`).
 *   - `onHover(roomId | null)` fires on pointer move, driving the hover tint.
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
}

export function ScenePicker({ scene, selectedRoomId, onSelect, onHover }: ScenePickerProps) {
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
      if (roomId === hoveredRef.current) return
      hoveredRef.current = roomId
      applyHover(roomId)
      onHover?.(roomId)
      invalidate()
    },
    [applyHover, onHover, invalidate],
  )

  const handlePointerOut = useCallback(() => {
    if (hoveredRef.current === null) return
    hoveredRef.current = null
    applyHover(null)
    onHover?.(null)
    invalidate()
  }, [applyHover, onHover, invalidate])

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
