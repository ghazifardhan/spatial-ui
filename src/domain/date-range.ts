/**
 * DateRange — an inclusive [start, end] span of whole days.
 *
 * Interface (what a caller must know):
 *   - `start` and `end` are ISO date strings (`YYYY-MM-DD`), inclusive on both ends.
 *   - Invariant: `start <= end`, lexicographically AND chronologically (ISO sorts both ways).
 *   - We store only the date (no time, no timezone). Ranges are half-open nowhere — a
 *     single-night stay is `{ start: '2025-01-01', end: '2025-01-01' }`.
 */

export interface DateRange {
  /** Inclusive first day, ISO `YYYY-MM-DD`. */
  start: string
  /** Inclusive last day, ISO `YYYY-MM-DD`. */
  end: string
}
