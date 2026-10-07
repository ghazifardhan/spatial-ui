/**
 * ApartmentScene — the entire 3D subtree for one unit, behind a single module boundary so it (and
 * the three.js it pulls in) can be **code-split** by lazy-loading this file (ADR 0039).
 *
 * This is the only component the shell imports from the 3D path; everything heavier
 * (scene-gen, viewer, interactions) lives behind this seam.
 *
 * Ceiling visibility is applied here as a pure visibility flip (ADR 0047) — the viewer stays
 * ceiling-agnostic and just renders whatever overlay it is handed.
 *
 * The hovered-room tooltip also lives here (ADR 0055): the picker reports the room under the
 * pointer plus its cursor coordinates, and we resolve that id to a human name from the schema and
 * hand it to the `RoomTooltip` overlay. The picking module never learns room names.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type Ref, type RefObject } from 'react'
import type { Apartment } from '../domain'
import { buildScene, setCeilingVisible } from '../scene-gen'
import { Viewer, type ViewerHandle } from '../viewer'
import { ScenePicker } from '../interactions'
import { CeilingToggle } from './CeilingToggle'
import { NavigationControls } from './NavigationControls'
import { RoomTooltip } from './RoomTooltip'
import { useViewerBackground } from './use-viewer-background'

export interface ApartmentSceneProps {
  apartment: Apartment
  selectedRoomId: string | null
  onSelectRoom: (roomId: string | null) => void
  showCeiling: boolean
  onToggleCeiling: (show: boolean) => void
  viewerRef?: Ref<ViewerHandle>
}
/** Where the tooltip currently points: the hovered room plus the hotspot's viewport coordinates. */
interface HoverState {
  roomId: string
  x: number
  y: number
}

export default function ApartmentScene({
  apartment,
  selectedRoomId,
  onSelectRoom,
  showCeiling,
  onToggleCeiling,
  viewerRef,
}: ApartmentSceneProps) {
  const localRef = useRef<ViewerHandle>(null)
  const scene = useMemo(() => buildScene(apartment.schema), [apartment])
  // Canvas backdrop follows the shell theme via the `--viewer-bg` token (ADR 0053). The viewer
  // stays theme-agnostic and receives a plain colour, exactly as its `background` prop documents.
  const viewerBackground = useViewerBackground()

  // Hovered-room tooltip (ADR 0055): picking reports the room id + pointer coords; we resolve that
  // id to a human name here, keeping room names out of the picking module.
  const [hover, setHover] = useState<HoverState | null>(null)
  // Small, static room-id → name table; a placement `Record` reads more directly than a Map.
  const roomNames = useMemo<Record<string, string>>(
    () => Object.fromEntries(apartment.schema.rooms.map((room) => [room.id, room.name])),
    [apartment],
  )
  const handlePointerRoom = useCallback((roomId: string | null, x: number, y: number) => {
    setHover(roomId === null ? null : { roomId, x, y })
  }, [])

  // The navigation controls need the viewer handle even when the caller didn't pass one, so we keep
  // our own ref and also mirror it into the optional outward `viewerRef` (ADR 0021).
  const setViewerRef = useMergedRef(localRef, viewerRef)

  // Pure visibility toggle — no rebuild (ADR 0047).
  useEffect(() => {
    setCeilingVisible(scene, showCeiling)
  }, [scene, showCeiling])

  return (
    // The wrapper is the reliable place to detect the pointer leaving the whole 3D area: R3F's
    // per-object `onPointerOut` can miss (or go stale) when the cursor exits onto empty space or
    // off the canvas, so clearing here guarantees the tooltip never lingers (ADR 0055).
    <div style={{ width: '100%', height: '100%' }} onPointerLeave={() => setHover(null)}>
      <Viewer
        ref={setViewerRef}
        scene={scene}
        background={viewerBackground}
        overlay={
          <>
            <CeilingToggle show={showCeiling} onChange={onToggleCeiling} />
            <NavigationControls viewerRef={localRef} />
            {hover && <RoomTooltip label={roomNames[hover.roomId]} x={hover.x} y={hover.y} />}
          </>
        }
      >
        <ScenePicker
          scene={scene}
          selectedRoomId={selectedRoomId}
          onSelect={onSelectRoom}
          onPointerRoom={handlePointerRoom}
        />
      </Viewer>
    </div>
  )
}

/** Compose an internal ref with an optional outward one (callback or object), filling both. */
function useMergedRef<T>(
  internal: RefObject<T | null>,
  outward: Ref<T> | undefined,
): (node: T | null) => void {
  return (node) => {
    internal.current = node
    if (typeof outward === 'function') outward(node)
    else if (outward) outward.current = node
  }
}
