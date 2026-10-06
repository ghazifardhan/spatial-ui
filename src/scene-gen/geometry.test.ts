import { describe, expect, it } from 'vitest'
import { wallPieces, wallRun, type WallPiece } from './geometry'
import type { Room, WallOpening } from '../domain'

const room: Room = {
  id: 'r',
  name: 'Room',
  rect: { x: 0, z: 0, w: 6, d: 4 },
  ceilingHeight: 3,
}

const opening = (over: Partial<WallOpening> = {}): WallOpening => ({
  id: 'o',
  room: 'r',
  wall: 'south',
  offset: 1,
  width: 1,
  sillHeight: 0,
  height: 2,
  ...over,
})

/** Total solid floor-to-ceiling wall area left after openings, ignoring lintels/sills. */
function fullHeightArea(pieces: WallPiece[]): number {
  return pieces
    .filter((p) => p.bottom === 0 && p.top === room.ceilingHeight)
    .reduce((sum, p) => sum + (p.span.end - p.span.start), 0)
}

describe('geometry.wallRun', () => {
  it('measures width for north/south walls', () => {
    expect(wallRun(room, 'north')).toBe(6)
    expect(wallRun(room, 'south')).toBe(6)
  })

  it('measures depth for east/west walls', () => {
    expect(wallRun(room, 'east')).toBe(4)
    expect(wallRun(room, 'west')).toBe(4)
  })
})

describe('geometry.wallPieces', () => {
  it('returns one full-height piece when there are no openings', () => {
    const pieces = wallPieces(room, 'south', [])
    expect(pieces).toHaveLength(1)
    expect(pieces[0]).toEqual({ span: { start: 0, end: 6 }, bottom: 0, top: 3 })
  })

  it('splits a wall around a mid-run opening into two full-height segments', () => {
    const pieces = wallPieces(room, 'south', [opening({ offset: 2, width: 1 })])
    const fullHeight = pieces.filter((p) => p.bottom === 0 && p.top === 3)
    // Left segment 0..2 and right segment 3..6.
    expect(fullHeight).toEqual([
      { span: { start: 0, end: 2 }, bottom: 0, top: 3 },
      { span: { start: 3, end: 6 }, bottom: 0, top: 3 },
    ])
  })

  it('adds a lintel above a full-height door opening', () => {
    const pieces = wallPieces(room, 'south', [opening({ offset: 2, width: 1, sillHeight: 0, height: 2.1 })])
    expect(pieces).toContainEqual({ span: { start: 2, end: 3 }, bottom: 2.1, top: 3 })
  })

  it('adds both a lintel and a sill for a window', () => {
    const pieces = wallPieces(room, 'south', [opening({ offset: 2, width: 1, sillHeight: 1, height: 1 })])
    expect(pieces).toContainEqual({ span: { start: 2, end: 3 }, bottom: 0, top: 1 }) // sill
    expect(pieces).toContainEqual({ span: { start: 2, end: 3 }, bottom: 2, top: 3 }) // lintel
  })

  it('conserves total solid wall when subtracting one opening (area accounting)', () => {
    // Full wall area = 6 * 3 = 18. A door 1 wide x 2.1 tall removes 2.1 of area.
    const pieces = wallPieces(room, 'south', [opening({ offset: 2, width: 1, height: 2.1 })])
    const area = pieces.reduce((sum, p) => sum + (p.span.end - p.span.start) * (p.top - p.bottom), 0)
    expect(area).toBeCloseTo(18 - 1 * 2.1, 5)
  })

  it('handles openings at the very start and end of the run', () => {
    const pieces = wallPieces(room, 'south', [
      opening({ id: 'a', offset: 0, width: 1, height: 2.1 }),
      opening({ id: 'b', offset: 5, width: 1, height: 2.1 }),
    ])
    const fullHeight = pieces.filter((p) => p.bottom === 0 && p.top === 3)
    // Only the middle 1..5 remains solid at full height.
    expect(fullHeight).toEqual([{ span: { start: 1, end: 5 }, bottom: 0, top: 3 }])
  })

  it('clamps an opening that runs past the wall end', () => {
    const pieces = wallPieces(room, 'south', [opening({ offset: 5.5, width: 2 })])
    // Clamped to 5.5..6; left segment 0..5.5 remains full height.
    expect(fullHeightArea(pieces)).toBe(5.5)
  })
})
