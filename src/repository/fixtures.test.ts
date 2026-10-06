import { describe, expect, it } from 'vitest'
import { APARTMENT_FIXTURES } from './fixtures'
import { buildWallSegments } from '../scene-gen/wall-segments'
import type { Apartment, Room, RoomRect } from '../domain'

/** Point-in-rect for the room's ground-plane footprint. */
function insideRect(rect: RoomRect, x: number, z: number): boolean {
  return x >= rect.x && x <= rect.x + rect.w && z >= rect.z && z <= rect.z + rect.d
}

function byId(rooms: Room[], id: string): Room | undefined {
  return rooms.find((r) => r.id === id)
}

describe('APARTMENT_FIXTURES', () => {
  it('has at least two fixtures (ADR 0014)', () => {
    expect(APARTMENT_FIXTURES.length).toBeGreaterThanOrEqual(2)
  })

  it.each(APARTMENT_FIXTURES.map((a) => [a.id, a] as [string, Apartment]))(
    '%s satisfies schema invariants',
    (_id, apt) => {
      const { rooms, openings, furniture, id: schemaId } = apt.schema

      // Ids match between Apartment and its schema.
      expect(schemaId).toBe(apt.id)

      // Rooms have positive-area rects and positive ceiling heights.
      for (const room of rooms) {
        expect(room.rect.w).toBeGreaterThan(0)
        expect(room.rect.d).toBeGreaterThan(0)
        expect(room.ceilingHeight).toBeGreaterThan(0)
      }

      // Room ids are unique.
      const roomIds = rooms.map((r) => r.id)
      expect(new Set(roomIds).size).toBe(roomIds.length)

      // Every opening references an existing room.
      for (const o of openings) {
        expect(byId(rooms, o.room), `opening ${o.id} references ${o.room}`).toBeDefined()
      }

      // Every furniture placement references an existing room.
      const WALL_MOUNTED = new Set(['wall-art'])
      for (const f of furniture) {
        const room = byId(rooms, f.room)
        expect(room, `furniture ${f.id} references ${f.room}`).toBeDefined()
        // Furniture sits inside its room's footprint on the ground plane.
        expect(insideRect(room!.rect, f.position.x, f.position.z), `furniture ${f.id} inside ${f.room}`).toBe(true)
        // Nothing sits below the floor; floor-standing items rest at y=0, wall-mounted ones float.
        expect(f.position.y).toBeGreaterThanOrEqual(0)
        if (!WALL_MOUNTED.has(f.type)) expect(f.position.y).toBe(0)
      }

      // Shared room boundaries must deduplicate to a single wall (ADR 0042): no two output wall
      // segments may be coincident in plane AND overlap.
      const segments = buildWallSegments(apt.schema)
      for (let i = 0; i < segments.length; i++) {
        for (let j = i + 1; j < segments.length; j++) {
          const a = segments[i]
          const b = segments[j]
          const coincident =
            a.axis === b.axis &&
            Math.abs(a.fixed - b.fixed) < 1e-3 &&
            Math.abs(a.bottom - b.bottom) < 1e-3 &&
            Math.abs(a.top - b.top) < 1e-3
          const overlapping = a.start < b.end - 1e-3 && b.start < a.end - 1e-3
          expect(coincident && overlapping, `segments ${i} and ${j} overlap`).toBe(false)
        }
      }
    },
  )
})
