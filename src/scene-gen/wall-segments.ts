/**
 * wall-segments — pure helpers for turning all rooms' walls into a deduplicated set of wall
 * segments (ADR 0042).
 *
 * Internal seam of scene-gen: not on the public interface, but tested directly because the dedupe
 * rule is the fix for the most visible artifact (interior double-walls).
 *
 * Interface (what a caller must know):
 *   - A wall segment is identified by (axis, fixed coordinate, span) where span is `[start, end]`
 *     along the run. Two segments from different rooms that coincide collapse to one.
 *   - Coincident is exact-in-plane: same axis, same fixed coordinate (within epsilon), and
 *     overlapping spans. Overlapping spans are UNIONED (so a shared wall drawn once per room becomes
 *     a single full-length wall).
 *   - Returns one segment per merged run; the caller builds geometry per segment.
 */

import type { Room, WallOpening, WallSide } from '../domain'
import { wallPieces } from './geometry'

const EPS = 1e-4

export type Axis = 'x' | 'z'

export interface DedupedWallPiece {
  axis: Axis
  /** World coordinate the wall sits at on its fixed axis (x for X-run walls, z for Z-run walls). */
  fixed: number
  /** Span along the run axis. */
  start: number
  end: number
  bottom: number
  top: number
  /** Ids of the rooms that contributed this piece (for tagging/tests). */
  roomIds: string[]
}

interface RawPiece {
  axis: Axis
  fixed: number
  start: number
  end: number
  bottom: number
  top: number
  roomId: string
}

function roomWallFrame(room: Room, side: WallSide): { axis: Axis; fixed: number } {
  const { x, z, w, d } = room.rect
  switch (side) {
    case 'north':
      return { axis: 'x', fixed: z }
    case 'south':
      return { axis: 'x', fixed: z + d }
    case 'west':
      return { axis: 'z', fixed: x }
    case 'east':
      return { axis: 'z', fixed: x + w }
  }
}

const WALL_SIDES: readonly WallSide[] = ['north', 'south', 'east', 'west']

/** Collect every room's wall pieces in world coordinates. */
export function collectWallPieces(schema: {
  rooms: Room[]
  openings: WallOpening[]
}): RawPiece[] {
  const pieces: RawPiece[] = []
  for (const room of schema.rooms) {
    for (const side of WALL_SIDES) {
      const openings = schema.openings.filter((o) => o.room === room.id && o.wall === side)
      const frame = roomWallFrame(room, side)
      const offset = frame.axis === 'x' ? room.rect.x : room.rect.z
      for (const piece of wallPieces(room, side, openings)) {
        pieces.push({
          axis: frame.axis,
          fixed: frame.fixed,
          start: piece.span.start + offset,
          end: piece.span.end + offset,
          bottom: piece.bottom,
          top: piece.top,
          roomId: room.id,
        })
      }
    }
  }
  return pieces
}

/**
 * Merge coincident pieces. Two pieces merge when they share axis + fixed coordinate + vertical
 * extent and their spans overlap or are adjacent. Merged spans are unions.
 */
export function dedupeWallPieces(pieces: RawPiece[]): DedupedWallPiece[] {
  const groups: DedupedWallPiece[] = []

  for (const piece of pieces) {
    const existing = groups.find(
      (g) =>
        g.axis === piece.axis &&
        Math.abs(g.fixed - piece.fixed) < EPS &&
        Math.abs(g.bottom - piece.bottom) < EPS &&
        Math.abs(g.top - piece.top) < EPS &&
        piece.start <= g.end + EPS &&
        g.start <= piece.end + EPS,
    )

    if (existing) {
      existing.start = Math.min(existing.start, piece.start)
      existing.end = Math.max(existing.end, piece.end)
      if (!existing.roomIds.includes(piece.roomId)) existing.roomIds.push(piece.roomId)
    } else {
      groups.push({
        axis: piece.axis,
        fixed: piece.fixed,
        start: piece.start,
        end: piece.end,
        bottom: piece.bottom,
        top: piece.top,
        roomIds: [piece.roomId],
      })
    }
  }

  return groups
}

/** Convenience: collect + dedupe in one call. */
export function buildWallSegments(schema: {
  rooms: Room[]
  openings: WallOpening[]
}): DedupedWallPiece[] {
  return dedupeWallPieces(collectWallPieces(schema))
}
