/**
 * viewer-control-requests — a tiny bridge between the Viewer's imperative handle and the R3F scene.
 *
 * The `<Canvas>` subtree owns the camera; the imperative handle lives outside the R3F reconciler.
 * Rather than bounce requests through React state (ADR 0012 forbids camera-in-state), the handle
 * writes a request into a mutable ref that `SceneContents` reads and applies inside `useFrame`.
 *
 * Interface (what a caller must know): this is INTERNAL to the viewer module.
 */

import { createContext, useContext } from 'react'
import type { MutableRefObject } from 'react'
import * as THREE from 'three'

export type CameraRequest =
  | { type: 'reset' }
  | { type: 'focus'; point: THREE.Vector3 }
  /** Dolly the camera in/out along its current view direction. `factor` < 1 zooms in, > 1 zooms out. */
  | { type: 'zoom'; factor: number }
  /** Slide the orbit target (and camera) sideways/up-down in the view plane. */
  | { type: 'pan'; right: number; up: number }
  /** Orbit the camera around its target. Angles are in radians. */
  | { type: 'orbit'; azimuth: number; polar: number }

export type CameraRequestRef = MutableRefObject<CameraRequest | null>

export const CameraRequestContext = createContext<CameraRequestRef | null>(null)

export function useCameraRequests(): CameraRequestRef {
  const ref = useContext(CameraRequestContext)
  if (!ref) {
    throw new Error('CameraRequestContext missing: SceneContents must render inside <Viewer>')
  }
  return ref
}
