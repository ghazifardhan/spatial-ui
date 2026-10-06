/**
 * geometry — pure helpers for turning a room rect + wall openings into wall box spans.
 *
 * This is an INTERNAL seam of scene-gen (codebase-design): not exported from the module's public
 * surface, but tested directly because the span math is the fiddliest part of the module.
 *
 * Interface (what a caller must know):
 *   - A room's wall "run" is its length along its axis; an opening has an `offset` from the wall's
 *     start corner and a `width`.
 *   - `wallSpans` returns the horizontal (X/Z) spans of solid wall left after openings, plus the
 *     lintel/sill spans above and below each opening.
 *   - All values are meters in the room's own frame. Y is up; the floor is at y=0.
 */

import type { Room, WallOpening, WallSide } from '../domain'

/** Length of a wall along its run axis. */
export function wallRun(room: Room, side: WallSide): number {
  return side === 'north' || side === 'south' ? room.rect.w : room.rect.d
}

/** A horizontal span along the wall run: `[start, end)` in meters from the wall's start corner. */
export interface Span {
  start: number
  end: number
}

/** A wall piece with an explicit vertical extent (for lintels/sills) plus its horizontal span. */
export interface WallPiece {
  span: Span
  /** Bottom of the piece, meters above the floor. */
  bottom: number
  /** Top of the piece, meters above the floor. */
  top: number
}

/**
 * Split a wall run into solid pieces around its openings (ADR 0018).
 *
 * Horizontal solid spans are the gaps between/around openings. Above each opening, a lintel span
 * (from the opening top to the ceiling); below, a sill span (floor to the opening bottom) when
 * `sillHeight > 0`.
 *
 * Openings are clamped to the wall and assumed not to overlap each other (a schema invariant we do
 * not currently enforce); if they do, spans merge conservatively.
 */
export function wallPieces(room: Room, side: WallSide, openings: WallOpening[]): WallPiece[] {
  const run = wallRun(room, side)
  const ceiling = room.ceilingHeight

  // Sort openings along the wall, clamped to [0, run].
  const cuts = openings
    .map((o) => ({
      start: Math.max(0, Math.min(o.offset, run)),
      end: Math.max(0, Math.min(o.offset + o.width, run)),
      bottom: Math.max(0, o.sillHeight),
      top: Math.min(ceiling, o.sillHeight + o.height),
    }))
    .filter((o) => o.end > o.start)
    .sort((a, b) => a.start - b.start)

  const pieces: WallPiece[] = []

  // Horizontal solid segments between openings.
  let cursor = 0
  for (const cut of cuts) {
    if (cut.start > cursor) {
      pieces.push({ span: { start: cursor, end: cut.start }, bottom: 0, top: ceiling })
    }
    cursor = Math.max(cursor, cut.end)
  }
  if (cursor < run) {
    pieces.push({ span: { start: cursor, end: run }, bottom: 0, top: ceiling })
  }

  // Lintels (above) and sills (below) for each opening.
  for (const cut of cuts) {
    if (cut.top < ceiling) {
      pieces.push({ span: { start: cut.start, end: cut.end }, bottom: cut.top, top: ceiling })
    }
    if (cut.bottom > 0) {
      pieces.push({ span: { start: cut.start, end: cut.end }, bottom: 0, top: cut.bottom })
    }
  }

  return pieces
}
