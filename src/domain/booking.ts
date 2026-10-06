/**
 * booking — a request→confirmation record binding a unit + date range + guest identity.
 *
 * ADR 0001: v1 moves no money, so a Booking is NOT a payment. But the domain must distinguish
 * "requested" from "confirmed" so payments/admin can slot in later without a rewrite.
 *
 * Interface (what a caller must know):
 *   - `status` is a lifecycle: 'requested' → 'confirmed' (or 'cancelled').
 *   - Only bookings in the {requested, confirmed} set block availability; cancelled ones do not
 *     (the repository is responsible for filtering, but consumers should not re-derive rules).
 *   - `guestEmail` is the guest identity for v1; there are no accounts (ADR 0001).
 */

import type { DateRange } from './date-range'

export type BookingStatus = 'requested' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  apartmentId: string
  range: DateRange
  guestEmail: string
  status: BookingStatus
  /** ISO timestamp. */
  createdAt: string
}

/** Statuses that occupy the calendar. Single source of truth for this rule. */
export const BLOCKING_STATUSES: readonly BookingStatus[] = ['requested', 'confirmed']

/** Whether a booking occupies its dates for availability purposes. */
export function isBlocking(booking: Booking): boolean {
  return BLOCKING_STATUSES.includes(booking.status)
}
