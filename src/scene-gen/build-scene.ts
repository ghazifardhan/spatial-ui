/**
 * scene-gen — Module #3
 *
 * The deep 3D module: turns an `ApartmentSchema` into a `THREE.Group` (ADR 0017) that a viewer can
 * mount directly. Small interface, large implementation.
 *
 * Interface (what a caller must know):
 *   - `buildScene(schema)` returns a `THREE.Group` in the world frame of ADR 0007 (meters, Y-up,
 *     origin at the unit's entrance).
 *   - The group contains one child group per room, named `room:<roomId>`. Every room-owned mesh
 *     carries `mesh.userData.roomId` (ADR 0019) so interactions can raycast-pick a room. A wall
 *     shared by two rooms carries the first contributing room's id and a `roomIds` array.
 *   - Floors sit at y=0, walls are boxes with openings cut out (ADR 0018) and **deduplicated at
 *     shared boundaries** (ADR 0042), furniture is placeholder-ish geometry (ADR 0020) with real
 *     materials from the palette (ADR 0041), window openings get translucent glass panes.
 *   - Meshes are tagged with `userData.kind` = 'floor' | 'wall' | 'ceiling' | 'baseboard' | 'glass'
 *     | 'furniture' for debugging/tests.
 *   - An unknown furniture type does NOT throw; it falls back to a default box (ADR 0020).
 */

import * as THREE from 'three'
import type { ApartmentSchema, Room } from '../domain'
import { wallRun } from './geometry'
import { buildWallSegments } from './wall-segments'
import { buildFurniture } from './furniture'
import { buildDoor, buildWindow } from './openings'
import { materials, type MaterialSet } from './palette'

const WALL_THICKNESS = 0.15
const CEILING_THICKNESS = 0.08
const BASEBOARD_HEIGHT = 0.09

/** Name of the group that owns a room's meshes; stable so interactions can find it. */
export function roomGroupName(roomId: string): string {
  return `room:${roomId}`
}

/**
 * Build the whole scene group for a schema.
 *
 * Pure with respect to inputs (no mutation of `schema`); returns fresh three.js objects each call.
 */
export function buildScene(schema: ApartmentSchema): THREE.Group {
  const root = new THREE.Group()
  root.name = `apartment:${schema.id}`
  const mats = materials()

  // One group per room holds that room's floor, baseboards and furniture.
  for (const room of schema.rooms) {
    const group = new THREE.Group()
    group.name = roomGroupName(room.id)
    group.add(buildFloor(room, mats))
    group.add(...buildBaseboards(room, mats))
    for (const placement of schema.furniture.filter((f) => f.room === room.id)) {
      group.add(buildFurniture(placement, room.id, mats))
    }
    root.add(group)
  }

  // Walls are deduplicated across rooms, so they live at the scene level, not per room.
  root.add(buildDeduplicatedWalls(schema, mats))

  // All ceilings live in one root group so visibility toggles in a single lookup (ADR 0047).
  root.add(buildCeilings(schema, mats))

  return root
}

/**
 * Name of the root group holding every ceiling. Toggling `group.visible` shows/hides all ceilings
 * at once (ADR 0047).
 */
export const CEILING_GROUP_NAME = 'ceiling'

/** Build all room ceilings into a single root group (ADR 0047). */
function buildCeilings(schema: ApartmentSchema, mats: MaterialSet): THREE.Group {
  const group = new THREE.Group()
  group.name = CEILING_GROUP_NAME
  for (const room of schema.rooms) group.add(buildCeiling(room, mats))
  return group
}

/** A floor slab: a thin box spanning the room rect, top surface at y=0. */
function buildFloor(room: Room, mats: MaterialSet): THREE.Mesh {
  const { x, z, w, d } = room.rect
  const thickness = 0.1
  const geometry = new THREE.BoxGeometry(w, thickness, d)
  const mesh = new THREE.Mesh(geometry, mats.floor)
  mesh.name = `floor:${room.id}`
  mesh.position.set(x + w / 2, -thickness / 2, z + d / 2)
  mesh.receiveShadow = true
  mesh.userData.roomId = room.id
  mesh.userData.kind = 'floor'
  return mesh
}

/** A ceiling slab at the room's height, so the unit doesn't read as an open-topped box. */
function buildCeiling(room: Room, mats: MaterialSet): THREE.Mesh {
  const { x, z, w, d } = room.rect
  const geometry = new THREE.BoxGeometry(w, CEILING_THICKNESS, d)
  const mesh = new THREE.Mesh(geometry, mats.ceiling)
  mesh.name = `ceiling:${room.id}`
  mesh.position.set(x + w / 2, room.ceilingHeight + CEILING_THICKNESS / 2, z + d / 2)
  mesh.userData.roomId = room.id
  mesh.userData.kind = 'ceiling'
  return mesh
}

/** Thin skirting boards along each solid wall base, for a lived-in finish. */
function buildBaseboards(room: Room, mats: MaterialSet): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = []
  const sides = ['north', 'south', 'east', 'west'] as const
  for (const side of sides) {
    const { w, d, x, z } = room.rect
    const along = side === 'north' || side === 'south' ? w : d
    const offset = side === 'north' || side === 'south' ? x : z
    const fixed =
      side === 'north' ? z : side === 'south' ? z + d : side === 'west' ? x : x + w

    const geometry =
      side === 'north' || side === 'south'
        ? new THREE.BoxGeometry(along, BASEBOARD_HEIGHT, WALL_THICKNESS * 0.6)
        : new THREE.BoxGeometry(WALL_THICKNESS * 0.6, BASEBOARD_HEIGHT, along)

    const mesh = new THREE.Mesh(geometry, mats.baseboard)
    mesh.name = `baseboard:${room.id}:${side}`
    if (side === 'north' || side === 'south') {
      mesh.position.set(offset + along / 2, BASEBOARD_HEIGHT / 2, fixed)
    } else {
      mesh.position.set(fixed, BASEBOARD_HEIGHT / 2, offset + along / 2)
    }
    mesh.userData.roomId = room.id
    mesh.userData.kind = 'baseboard'
    meshes.push(mesh)
  }
  return meshes
}

/** Walls for the whole unit, deduplicated at shared boundaries (ADR 0042), plus window glass. */
function buildDeduplicatedWalls(schema: ApartmentSchema, mats: MaterialSet): THREE.Group {
  const group = new THREE.Group()
  group.name = 'walls'

  const accentRooms = accentRoomIdSet(schema)

  for (const segment of buildWallSegments(schema)) {
    const height = segment.top - segment.bottom
    if (height <= 0 || segment.end - segment.start <= 0) continue
    const length = segment.end - segment.start
    const along = segment.start + length / 2
    const centerY = segment.bottom + height / 2

    const geometry =
      segment.axis === 'x'
        ? new THREE.BoxGeometry(length, height, WALL_THICKNESS)
        : new THREE.BoxGeometry(WALL_THICKNESS, height, length)

    const primaryRoom = segment.roomIds[0]
    const useAccent = accentRooms.has(primaryRoom)
    const mesh = new THREE.Mesh(geometry, useAccent ? mats.wallAccent : mats.wall)
    mesh.name = `wall:${segment.roomIds.join('+')}`
    if (segment.axis === 'x') mesh.position.set(along, centerY, segment.fixed)
    else mesh.position.set(segment.fixed, centerY, along)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.roomId = primaryRoom
    mesh.userData.roomIds = segment.roomIds
    mesh.userData.kind = 'wall'
    group.add(mesh)
  }

  // Real doors and framed windows (ADR 0044). `sillHeight > 0` marks a window; 0 marks a door.
  for (const opening of schema.openings) {
    const room = schema.rooms.find((r) => r.id === opening.room)
    if (!room) continue
    group.add(
      opening.sillHeight > 0
        ? buildWindow(opening, room, mats)
        : buildDoor(opening, room, mats),
    )
  }

  return group
}

/** Pick a couple of rooms to give an accent wall, so the unit isn't uniform. */
function accentRoomIdSet(schema: ApartmentSchema): Set<string> {
  const ids = schema.rooms.map((r) => r.id)
  // The room after the first (e.g. a bedroom) gets an accent wall.
  return new Set(ids.length > 1 ? [ids[1]] : [])
}

/** Exposed for tests: the wall-run helper, re-exported so the module's seams stay discoverable. */
export { wallRun }
