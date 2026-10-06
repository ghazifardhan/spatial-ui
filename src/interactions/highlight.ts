/**
 * highlight — applies a visual tint to all meshes of a room by swapping their material reference,
 * restoring the originals when cleared (ADR 0027).
 *
 * Interface (what a caller must know):
 *   - `createHighlighter(sceneRoot)` returns `{ highlight(roomId, tint), clear() }`.
 *   - Only ONE room is highlighted at a time; a new `highlight` clears the previous first, so the
 *     highlighter is a single-slot, not a stack.
 *   - The original material is captured per mesh the first time it is touched, so restore is exact
 *     even though scene-gen shares one default material across meshes.
 *   - `clear()` restores all currently-highlighted meshes.
 *
 * This is the one place interactions mutates three.js objects. It uses the per-room grouping and
 * `userData.roomId` tagging from scene-gen (ADR 0019).
 */

import * as THREE from 'three'

export type Tint = 'hover' | 'select'

export interface Highlighter {
  /** Highlight the given room with a tint; clears any previous highlight first. */
  highlight(roomId: string | null, tint: Tint): void
  /** Restore the currently-highlighted room to its original material. */
  clear(): void
}

/** Shared tint materials so we allocate at most two. */
const TINT_MATERIALS: Record<Tint, THREE.Material> = {
  hover: new THREE.MeshStandardMaterial({ color: '#9ecbff', emissive: '#2b4d80', roughness: 0.8 }),
  select: new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#7a4d00', roughness: 0.7 }),
}

export function createHighlighter(sceneRoot: THREE.Object3D): Highlighter {
  // Meshes currently wearing a tint, mapped to the material they had before.
  const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()
  let currentRoomId: string | null = null

  function meshesOfRoom(roomId: string): THREE.Mesh[] {
    const group = sceneRoot.getObjectByName(`room:${roomId}`)
    if (!group) return []
    const meshes: THREE.Mesh[] = []
    group.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) meshes.push(object as THREE.Mesh)
    })
    return meshes
  }

  function clear(): void {
    for (const [mesh, original] of originalMaterials) {
      mesh.material = original
    }
    originalMaterials.clear()
    currentRoomId = null
  }

  function highlight(roomId: string | null, tint: Tint): void {
    if (roomId === currentRoomId) return
    clear()
    if (!roomId) return

    const material = TINT_MATERIALS[tint]
    for (const mesh of meshesOfRoom(roomId)) {
      originalMaterials.set(mesh, mesh.material)
      mesh.material = material
    }
    currentRoomId = roomId
  }

  return { highlight, clear }
}
