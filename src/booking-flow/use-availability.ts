/**
 * useAvailability — fetches an apartment's existing bookings for the pure availability rule
 * (ADR 0008, 0031).
 *
 * Interface (what a caller must know):
 *   - `useAvailability(apartment, bookingRepository)` returns the apartment's bookings.
 *   - Fetching is keyed by `apartment.id`; a stale response for a previous apartment is ignored.
 *   - The hook does NOT decide availability — it hands fetched bookings to the pure rule, which the
 *     caller (validation) runs. Keeps the domain rule the single source of truth.
 *
 * No `loading` flag: nothing consumes it yet, and a field that is always false is worse than adding
 * it when a real need appears (consistent with the project's YAGNI deferrals).
 */

import { useEffect, useState } from 'react'
import type { Apartment, Booking } from '../domain'
import type { BookingRepository } from '../repository'

const EMPTY: Booking[] = []

export function useAvailability(
  apartment: Apartment | null,
  bookingRepository: BookingRepository,
): Booking[] {
  const [bookings, setBookings] = useState<Booking[]>(EMPTY)

  useEffect(() => {
    if (!apartment) return

    let cancelled = false

    // Asynchronous fetch from an external system — the legitimate use of an effect.
    bookingRepository
      .listByApartment(apartment.id)
      .then((result) => {
        if (!cancelled) setBookings(result)
      })
      .catch(() => {
        // A failed fetch leaves no bookings to reason about; validation then checks blackouts only.
        // Surfacing fetch errors is a v2 concern.
        if (!cancelled) setBookings(EMPTY)
      })

    return () => {
      cancelled = true
    }
  }, [apartment, bookingRepository])

  return apartment ? bookings : EMPTY
}
