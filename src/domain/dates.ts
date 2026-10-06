/**
 * dates — pure date helpers for ISO `YYYY-MM-DD` whole-day values.
 *
 * Why not `Date`? Timezones and times-of-day are the source of most booking bugs. We treat a
 * date as an opaque ISO string and do calendar arithmetic in UTC internally, so a "day" is
 * always exactly 86_400_000 ms and never shifts across DST or locale.
 *
 * All functions are pure. Invalid input throws (fail fast at the seam); callers that want a
 * boolean should use `availability`, not try/catch here.
 */

import type { DateRange } from './date-range'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const MS_PER_DAY = 86_400_000

/** Parse an ISO `YYYY-MM-DD` string to milliseconds-since-epoch at UTC midnight. Throws on bad input. */
export function toEpochDay(iso: string): number {
  if (!ISO_DATE.test(iso)) {
    throw new Error(`Invalid ISO date: ${JSON.stringify(iso)} (expected YYYY-MM-DD)`)
  }
  const ms = Date.parse(`${iso}T00:00:00Z`)
  if (Number.isNaN(ms)) {
    throw new Error(`Invalid ISO date: ${JSON.stringify(iso)}`)
  }
  return ms
}

/** Format milliseconds-since-epoch (UTC midnight) back to `YYYY-MM-DD`. */
export function fromEpochDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Whole-day difference `a - b`. Positive when `a` is later. */
export function daysBetween(a: string, b: string): number {
  return Math.round((toEpochDay(a) - toEpochDay(b)) / MS_PER_DAY)
}

/** Add (or subtract, with a negative number) whole days to an ISO date. */
export function addDays(iso: string, days: number): string {
  return fromEpochDay(toEpochDay(iso) + days * MS_PER_DAY)
}

/** Number of inclusive nights in a range. A single day is 1; an invalid/empty range is 0. */
export function nights(range: DateRange): number {
  if (range.end < range.start) return 0
  return daysBetween(range.end, range.start) + 1
}

/**
 * Whether two inclusive ranges overlap, sharing at least one day.
 * Touching-but-not-overlapping ranges (e.g. Jan 1–5 and Jan 6–10) do NOT overlap.
 */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  // No overlap iff one ends strictly before the other begins.
  return !(a.end < b.start || b.end < a.start)
}
