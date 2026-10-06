/**
 * ApartmentScene — the entire 3D subtree for one unit, behind a single module boundary so it (and
 * the three.js it pulls in) can be **code-split** by lazy-loading this file (ADR 0039).
 *
 * This is the only component the shell imports from the 3D path; everything heavier
 * (scene-gen, viewer, interactions) lives behind this seam.
 *
 * Ceiling visibility is applied here as a pure visibility flip (ADR 0047) — the viewer stays
 * ceiling-agnostic and just renders whatever overlay it is handed.
 */

import { useEffect, useMemo, useRef, type Ref, type RefObject } from 'react'
import type { Apartment } from '../domain'
import { buildScene, setCeilingVisible } from '../scene-gen'
import { Viewer, type ViewerHandle } from '../viewer'
import { ScenePicker } from '../interactions'
import { CeilingToggle } from './CeilingToggle'
import { NavigationControls } from './NavigationControls'
import { useViewerBackground } from './use-viewer-background'

export interface ApartmentSceneProps {
  apartment: Apartment
  selectedRoomId: string | null
  onSelectRoom: (roomId: string | null) => void
  showCeiling: boolean
  onToggleCeiling: (show: boolean) => void
  viewerRef?: Ref<ViewerHandle>
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

  // The navigation controls need the viewer handle even when the caller didn't pass one, so we keep
  // our own ref and also mirror it into the optional outward `viewerRef` (ADR 0021).
  const setViewerRef = useMergedRef(localRef, viewerRef)

  // Pure visibility toggle — no rebuild (ADR 0047).
  useEffect(() => {
    setCeilingVisible(scene, showCeiling)
  }, [scene, showCeiling])

  return (
    <Viewer
      ref={setViewerRef}
      scene={scene}
      background={viewerBackground}
      overlay={
        <>
          <CeilingToggle show={showCeiling} onChange={onToggleCeiling} />
          <NavigationControls viewerRef={localRef} />
        </>
      }
    >
      <ScenePicker scene={scene} selectedRoomId={selectedRoomId} onSelect={onSelectRoom} />
    </Viewer>
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
