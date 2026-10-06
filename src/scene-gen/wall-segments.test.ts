import { describe, expect, it } from 'vitest'
import { buildWallSegments, dedupeWallPieces } from './wall-segments'
import type { Room } from '../domain'

const room = (over: Partial<Room> & { id: string }): Room => ({
  name: over.id,
  rect: { x: 0, z: 0, w: 4, d: 3 },
  ceilingHeight: 2.7,
  ...over,
})

describe('dedupeWallPieces', () => {
  it('unions two coincident overlapping pieces into one', () => {
    const merged = dedupeWallPieces([
      { axis: 'x', fixed: 0, start: 0, end: 4, bottom: 0, top: 2.7, roomId: 'a' },
      { axis: 'x', fixed: 0, start: 2, end: 6, bottom: 0, top: 2.7, roomId: 'b' },
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].start).toBe(0)
    expect(merged[0].end).toBe(6)
    expect(merged[0].roomIds.sort()).toEqual(['a', 'b'])
  })

  it('merges adjacent pieces (touching ends)', () => {
    const merged = dedupeWallPieces([
      { axis: 'z', fixed: 1, start: 0, end: 2, bottom: 0, top: 2.7, roomId: 'a' },
      { axis: 'z', fixed: 1, start: 2, end: 4, bottom: 0, top: 2.7, roomId: 'b' },
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].end).toBe(4)
  })

  it('keeps pieces at different fixed coordinates separate', () => {
    const merged = dedupeWallPieces([
      { axis: 'x', fixed: 0, start: 0, end: 4, bottom: 0, top: 2.7, roomId: 'a' },
      { axis: 'x', fixed: 5, start: 0, end: 4, bottom: 0, top: 2.7, roomId: 'b' },
    ])
    expect(merged).toHaveLength(2)
  })

  it('keeps a lintel separate from the wall below it (different vertical extent)', () => {
    const merged = dedupeWallPieces([
      { axis: 'x', fixed: 0, start: 0, end: 4, bottom: 0, top: 2.0, roomId: 'a' },
      { axis: 'x', fixed: 0, start: 0, end: 4, bottom: 2.0, top: 2.7, roomId: 'a' },
    ])
    expect(merged).toHaveLength(2)
  })
})

describe('buildWallSegments', () => {
  it('collapses the shared boundary between two flush rooms to a single wall (ADR 0042)', () => {
    // Room A occupies x 0..4; room B x 4..8, same z band. Their touching edge at x=4 is shared.
    const schema = {
      rooms: [room({ id: 'a', rect: { x: 0, z: 0, w: 4, d: 3 } }), room({ id: 'b', rect: { x: 4, z: 0, w: 4, d: 3 } })],
      openings: [],
    }
    const segments = buildWallSegments(schema)
    // The shared edge at x=4 (axis 'z') must appear exactly once.
    const shared = segments.filter((s) => s.axis === 'z' && Math.abs(s.fixed - 4) < 1e-3)
    expect(shared).toHaveLength(1)
    // And it knows about both rooms.
    expect(shared[0].roomIds.sort()).toEqual(['a', 'b'])
  })

  it('produces four walls for a single isolated room', () => {
    const schema = { rooms: [room({ id: 'a', rect: { x: 0, z: 0, w: 4, d: 3 } })], openings: [] }
    expect(buildWallSegments(schema)).toHaveLength(4)
  })
})
