/**
 * Composition root for the repository module: builds in-memory adapters seeded with the fixtures.
 *
 * Callers receive the INTERFACES, never the concrete classes, so swapping to a backend adapter
 * later is a one-line change here (ADR 0004).
 */
import type { ApartmentRepository, BookingRepository } from './types'
import { InMemoryApartmentRepository } from './in-memory-apartment-repository'
import { InMemoryBookingRepository } from './in-memory-booking-repository'
import { APARTMENT_FIXTURES } from './fixtures'

export interface Repositories {
  apartments: ApartmentRepository
  bookings: BookingRepository
}

/** Build a fresh set of in-memory repositories. A backend build would return HTTP adapters here. */
export function createInMemoryRepositories(): Repositories {
  return {
    apartments: new InMemoryApartmentRepository(APARTMENT_FIXTURES),
    bookings: new InMemoryBookingRepository(),
  }
}
