/**
 * resolve-selection — the pure core of the interactions module (ADR 0029).
 *
 * Interface (what a caller must know):
 *   - `resolveSelection(object)` maps a raycast hit (or null) to a room id, or `null` when nothing
 *     room-owned was hit.
 *   - It delegates to scene-gen's `roomIdOf`, which walks the parent chain to find `userData.roomId`
 *     (ADR 0019). This module adds no geometry knowledge of its own.
 *
 * Pure: no I/O, no React, no three.js mutation.
 */

import type * as THREE from 'three'
import { roomIdOf } from '../scene-gen'

export function resolveSelection(hit: THREE.Object3D | null | undefined): string | null {
  if (!hit) return null
  return roomIdOf(hit)
}
