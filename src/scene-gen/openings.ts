/**
 * openings — builds real doors and framed windows for wall openings (ADR 0044).
 *
 * Internal seam of scene-gen: pure-ish builders that return `THREE.Object3D`s. Kept separate from
 * build-scene.ts so the fiddly opening geometry has one home.
 *
 * Interface (what a caller must know):
 *   - `buildWindow(opening, room, mats)` returns a group: outer frame, subdivided glazing, and a sill.
 *   - `buildDoor(opening, room, mats)` returns a group: jambs + head (frame) and a leaf swung open,
 *     plus a handle.
 *   - Both are positioned in world space from the opening's room + wall + offset, using the same
 *     wall-frame convention as geometry.ts.
 */

import * as THREE from 'three'
import type { Room, WallOpening } from '../domain'
import type { MaterialSet } from './palette'

const WALL_THICKNESS = 0.15
const FRAME = 0.05

interface WallPlacement {
  /** 'x' means the wall runs along X (its normal is Z); 'z' the opposite. */
  axis: 'x' | 'z'
  /** World coordinate on the fixed axis (the wall's plane). */
  fixed: number
  /** World coordinate (along the run) of the opening's centre. */
  alongCenter: number
}

function placementFor(opening: WallOpening, room: Room): WallPlacement {
  const { x, z, w, d } = room.rect
  switch (opening.wall) {
    case 'north':
      return { axis: 'x', fixed: z, alongCenter: x + opening.offset + opening.width / 2 }
    case 'south':
      return { axis: 'x', fixed: z + d, alongCenter: x + opening.offset + opening.width / 2 }
    case 'west':
      return { axis: 'z', fixed: x, alongCenter: z + opening.offset + opening.width / 2 }
    case 'east':
      return { axis: 'z', fixed: x + w, alongCenter: z + opening.offset + opening.width / 2 }
  }
}

/** A box sized along the wall's run (length) or through its thickness, at a given height. */
function wallBox(
  placement: WallPlacement,
  alongLength: number,
  height: number,
  thickness: number,
  yCenter: number,
  material: THREE.Material,
  alongOffset = 0,
): THREE.Mesh {
  const geometry =
    placement.axis === 'x'
      ? new THREE.BoxGeometry(alongLength, height, thickness)
      : new THREE.BoxGeometry(thickness, height, alongLength)
  const mesh = new THREE.Mesh(geometry, material)
  const along = placement.alongCenter + alongOffset
  if (placement.axis === 'x') mesh.position.set(along, yCenter, placement.fixed)
  else mesh.position.set(placement.fixed, yCenter, along)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** Window: frame ring + mullion-split glazing + an interior sill. */
export function buildWindow(opening: WallOpening, room: Room, mats: MaterialSet): THREE.Group {
  const group = new THREE.Group()
  group.name = `window:${opening.id}`
  group.userData.roomId = room.id
  group.userData.kind = 'window'

  const p = placementFor(opening, room)
  const w = opening.width
  const h = opening.height
  const yc = opening.sillHeight + h / 2

  // Frame: left/right jambs + head + bottom rail.
  group.add(wallBox(p, FRAME, h, WALL_THICKNESS, yc, mats.doorFrame, -(w - FRAME) / 2))
  group.add(wallBox(p, FRAME, h, WALL_THICKNESS, yc, mats.doorFrame, (w - FRAME) / 2))
  group.add(wallBox(p, w, FRAME, WALL_THICKNESS, opening.sillHeight + h - FRAME / 2, mats.doorFrame))
  group.add(wallBox(p, w, FRAME, WALL_THICKNESS, opening.sillHeight + FRAME / 2, mats.doorFrame))
  // Central mullion.
  group.add(wallBox(p, FRAME * 0.8, h, WALL_THICKNESS * 0.8, yc, mats.doorFrame))

  // Glazing (slightly thinner than the wall).
  const glass = wallBox(p, w - FRAME, h - FRAME, WALL_THICKNESS * 0.2, yc, mats.glass)
  glass.userData.kind = 'glass'
  glass.castShadow = false
  group.add(glass)

  // Interior sill.
  const sill = wallBox(p, w + 0.12, 0.04, WALL_THICKNESS + 0.14, opening.sillHeight - 0.02, mats.baseboard)
  sill.userData.kind = 'window-sill'
  group.add(sill)

  return group
}

/** Door: jamb + head frame, and a leaf swung slightly open with a handle. */
export function buildDoor(opening: WallOpening, room: Room, mats: MaterialSet): THREE.Group {
  const group = new THREE.Group()
  group.name = `door:${opening.id}`
  group.userData.roomId = room.id
  group.userData.kind = 'door'

  const p = placementFor(opening, room)
  const w = opening.width
  const h = opening.height

  // Frame: two jambs + head, all full wall thickness.
  group.add(wallBox(p, FRAME, h, WALL_THICKNESS, h / 2, mats.doorFrame, -(w - FRAME) / 2))
  group.add(wallBox(p, FRAME, h, WALL_THICKNESS, h / 2, mats.doorFrame, (w - FRAME) / 2))
  group.add(wallBox(p, w, FRAME, WALL_THICKNESS, h - FRAME / 2, mats.doorFrame))

  // Leaf, hinged at the left jamb and swung into the room ~25 degrees.
  const leafWidth = w - FRAME * 2
  const leafThickness = 0.045
  const leafGeometry =
    p.axis === 'x'
      ? new THREE.BoxGeometry(leafWidth, h - FRAME, leafThickness)
      : new THREE.BoxGeometry(leafThickness, h - FRAME, leafWidth)
  const leaf = new THREE.Mesh(leafGeometry, mats.doorLeaf)
  leaf.castShadow = true
  leaf.receiveShadow = true

  const hingeAlong = p.alongCenter - (w - FRAME) / 2
  const hinge = new THREE.Group()
  if (p.axis === 'x') hinge.position.set(hingeAlong, 0, p.fixed)
  else hinge.position.set(p.fixed, 0, hingeAlong)
  // Put the leaf's local origin at its hinge edge.
  if (p.axis === 'x') leaf.position.set(leafWidth / 2, (h - FRAME) / 2, 0)
  else leaf.position.set(0, (h - FRAME) / 2, leafWidth / 2)
  hinge.add(leaf)

  // Swing about the vertical axis at the hinge.
  const openAngle = (p.axis === 'x' ? 1 : -1) * 0.42
  hinge.rotation.y = openAngle

  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), mats.metal)
  const handleAlong = leafWidth - 0.08
  if (p.axis === 'x') handle.position.set(handleAlong, 0, leafThickness)
  else handle.position.set(leafThickness, 0, handleAlong)
  handle.position.y = 0
  leaf.add(handle)

  group.add(hinge)
  return group
}
