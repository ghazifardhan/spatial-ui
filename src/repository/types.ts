/**
 * repository — Module #2
 *
 * The data-access seam (ADR 0004, 0015, 0016). Callers depend only on these interfaces; the
 * in-memory adapters below satisfy them now, and a real backend adapter satisfies them later
 * without any caller changing.
 *
 * Interface (what a caller must know):
 *   - Every method is async (returns a Promise) even for the in-memory adapter (ADR 0015).
 *   - "Not found" resolves to `null`; real errors reject (ADR 0016).
 *   - The repository is a DUMB data seam: it fetches. It does NOT decide availability (ADR 0008).
 */

import type { Apartment, Booking } from '../domain'

export interface ApartmentRepository {
  /** All bookable apartments. */
  list(): Promise<Apartment[]>
  /** One apartment by id, or `null` if none exists. */
  findById(id: string): Promise<Apartment | null>
}

/** The fields a caller supplies to create a booking; the repository assigns id/createdAt/status. */
export interface NewBooking {
  apartmentId: string
  range: Booking['range']
  guestEmail: string
}

export interface BookingRepository {
  /** All bookings for one apartment, in no particular order. */
  listByApartment(apartmentId: string): Promise<Booking[]>
  /** Persist a new booking (status 'requested'), returning the stored record. */
  create(input: NewBooking): Promise<Booking>
}
