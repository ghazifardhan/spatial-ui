/**
 * scene-gen — Module #3 interface surface.
 *
 * Callers get `buildScene`, the small tags/names they need to interpret the output
 * (`roomGroupName`, `roomIdOf`), and `setCeilingVisible` to toggle ceilings (ADR 0047). The geometry
 * internals are deliberately not exported.
 */

export { buildScene, roomGroupName, CEILING_GROUP_NAME } from './build-scene'

import type * as THREE from 'three'
import { CEILING_GROUP_NAME } from './build-scene'

/**
 * Read the room id scene-gen tagged onto a mesh (ADR 0019), walking up the parent chain if the
 * hit object is a nested child. Returns `null` for untagged objects.
 */
export function roomIdOf(object: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = object
  while (current) {
    const id = current.userData?.roomId
    if (typeof id === 'string') return id
    current = current.parent
  }
  return null
}

/**
 * Show or hide the whole ceiling in one lookup (ADR 0047). Pure visibility — no geometry changes.
 * Returns whether a ceiling group was found.
 */
export function setCeilingVisible(scene: THREE.Object3D, visible: boolean): boolean {
  const group = scene.getObjectByName(CEILING_GROUP_NAME)
  if (!group) return false
  group.visible = visible
  return true
}

/** Whether a ceiling group exists in the scene. */
export function hasCeiling(scene: THREE.Object3D): boolean {
  return scene.getObjectByName(CEILING_GROUP_NAME) !== undefined
}
