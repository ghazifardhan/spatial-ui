/**
 * framing — pure math for pointing a camera at a scene's bounding box (ADR 0024).
 *
 * Internal seam of the viewer: not part of its public interface, but tested directly because the
 * distance math is fiddly and easy to get subtly wrong.
 *
 * Interface (what a caller must know):
 *   - `frameDistance(radius, fovDeg)` returns the distance at which a sphere of `radius` fits in
 *     the camera's vertical FOV with a little padding. Always positive.
 *   - `computeBounds(object)` returns the scene's bounding sphere (centre + radius); an empty scene
 *     yields a default radius of 1 so the camera never degenerates.
 */

import * as THREE from 'three'

/** Padding factor: frame a bit wider than the object so it is comfortably inside the viewport. */
export const FRAME_PADDING = 1.25

/** Default radius used when a scene has no measurable size (e.g. empty group). */
export const DEFAULT_RADIUS = 1

/**
 * Distance the camera must sit from a sphere of `radius` to fit it within a vertical FOV of
 * `fovDeg` degrees, with padding applied.
 */
export function frameDistance(radius: number, fovDeg: number): number {
  const safeRadius = radius > 0 ? radius : DEFAULT_RADIUS
  const halfFov = THREE.MathUtils.degToRad(fovDeg) / 2
  return (safeRadius * FRAME_PADDING) / Math.sin(halfFov)
}

export interface SceneBounds {
  center: THREE.Vector3
  radius: number
}

/**
 * Bounding sphere of an object (and its descendants). Ignores the object's own transform for the
 * centre-on-world assumption of a freshly-built scene; returns a safe default for empty scenes.
 */
export function computeBounds(object: THREE.Object3D): SceneBounds {
  const box = new THREE.Box3().setFromObject(object)
  if (box.isEmpty()) {
    return { center: new THREE.Vector3(0, 0, 0), radius: DEFAULT_RADIUS }
  }
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  if (!(sphere.radius > 0)) {
    return { center: sphere.center.clone(), radius: DEFAULT_RADIUS }
  }
  return { center: sphere.center.clone(), radius: sphere.radius }
}
