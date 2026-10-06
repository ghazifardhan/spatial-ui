/**
 * availability — pure date rules for whether a unit can be booked.
 *
 * ADR 0008: this module owns *all* availability logic. The repository only fetches bookings and
 * blackouts; it never decides. Because this is pure (no I/O), the same rules run client- and
 * (later) server-side unchanged.
 *
 * Interface (what a caller must know):
 *   - Inputs are already-fetched data: a requested DateRange, a unit's blackout ranges, and the
 *     existing bookings on that unit.
 *   - A range is available iff it overlaps no blackout AND no existing booking.
 *   - The requested range must be valid (start <= end) and non-empty; an invalid range is
 *     reported as unavailable with a reason, never thrown.
 */

import type { DateRange } from './date-range'
import { rangesOverlap } from './dates'

/** Why a range is unavailable. A discriminated result keeps callers honest — no boolean guessing. */
export type UnavailableReason = 'invalid-range' | 'blacked-out' | 'already-booked'

export type AvailabilityResult =
  | { available: true }
  | { available: false; reason: UnavailableReason; conflict?: DateRange }

export interface AvailabilityInput {
  /** The range the guest wants. */
  requested: DateRange
  /** Ranges the unit is blocked for (maintenance, owner use, etc.). */
  blackouts: readonly DateRange[]
  /** Existing bookings on the unit. Only their ranges matter here. */
  bookings: readonly { range: DateRange }[]
}

/** Evaluate whether `requested` is bookable given blackouts and existing bookings. */
export function check(input: AvailabilityInput): AvailabilityResult {
  const { requested, blackouts, bookings } = input

  if (requested.end < requested.start) {
    return { available: false, reason: 'invalid-range' }
  }

  const blackout = blackouts.find((b) => rangesOverlap(b, requested))
  if (blackout) {
    return { available: false, reason: 'blacked-out', conflict: blackout }
  }

  const booking = bookings.find((b) => rangesOverlap(b.range, requested))
  if (booking) {
    return { available: false, reason: 'already-booked', conflict: booking.range }
  }

  return { available: true }
}

/** Convenience predicate for callers that only need a boolean. */
export function isAvailable(input: AvailabilityInput): boolean {
  return check(input).available
}
