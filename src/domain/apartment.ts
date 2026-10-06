/**
 * apartment — the parametric description of a unit, per ADR 0002 / 0006 / 0007.
 *
 * Interface (what a caller must know):
 *   - All dimensions are in METERS. World frame is three.js canonical: Y-up, right-handed (ADR 0007).
 *   - A room footprint is an AXIS-ALIGNED RECTANGLE on the ground plane: `rect = { x, z, w, d }`,
 *     where `(x, z)` is the room's near corner and `w`/`d` extend along +X / +Z. Y is up; floors
 *     are at y=0 and rooms rise by `ceilingHeight`.
 *   - Wall openings (doors/windows) reference a room, one of its 4 walls, and an offset along that
 *     wall; `offset` is measured from the wall's start corner (see WallSide).
 *   - Furniture is placed by `type` (catalogue key) with a position and a yaw rotation.
 *
 * These types are the schema seam that the scene generator (Module #3) consumes. Changing them is
 * an interface change and should be recorded as an ADR.
 */

import type { DateRange } from './date-range'

export type RoomId = string
export type FurnitureType = string

/** Axis-aligned classroom-style rectangle on the ground plane. `(x, z)` is the near corner. */
export interface RoomRect {
  x: number
  z: number
  w: number
  d: number
}

/**
 * Which of a room's four walls an opening sits in, from the room's own frame:
 *   - 'north' = the wall at min Z (z = rect.z)
 *   - 'south' = the wall at max Z (z = rect.z + rect.d)
 *   - 'west'  = the wall at min X (x = rect.x)
 *   - 'east'  = the wall at max X (x = rect.x + rect.w)
 * `offset` runs along the wall from its low-coordinate end.
 */
export type WallSide = 'north' | 'south' | 'east' | 'west'

export interface WallOpening {
  id: string
  room: RoomId
  wall: WallSide
  /** Distance (m) from the wall's start corner to the opening's start. */
  offset: number
  width: number
  /** Distance (m) from the floor to the opening's bottom. 0 for doors. */
  sillHeight: number
  height: number
}

export interface Room {
  id: RoomId
  /** Human-readable name shown in the info panel (ADR 0013). */
  name: string
  rect: RoomRect
  /** Height (m) of the room from floor (y=0) to ceiling. */
  ceilingHeight: number
}

export interface FurniturePlacement {
  id: string
  type: FurnitureType
  room: RoomId
  /** Position (m): x and z on the ground plane; y is the item's base. */
  position: { x: number; y: number; z: number }
  /** Yaw rotation (radians) about the Y axis. */
  rotationY: number
}

/**
 * The full parametric description of a unit. `id` matches the owning Apartment's id.
 * Invariant: every `WallOpening.room` and `FurniturePlacement.room` references an existing
 * `Room.id`; every `Room` has a positive `ceilingHeight` and a positive-area rect.
 */
export interface ApartmentSchema {
  id: string
  rooms: Room[]
  openings: WallOpening[]
  furniture: FurniturePlacement[]
}

/** A bookable listing: the unit's metadata plus its spatial schema. */
export interface Apartment {
  id: string
  name: string
  /** Price per night, in the smallest currency unit to avoid float drift (e.g. cents/idr). */
  nightlyPriceMinor: number
  currency: string
  /** ISO `YYYY-MM-DD`. */
  unavailableDates: DateRange[]
  schema: ApartmentSchema
}
