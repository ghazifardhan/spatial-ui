/**
 * In-memory booking adapter — satisfies `BookingRepository` (ADR 0004, 0015, 0016).
 *
 * The adapter is a DUMB data seam: it stores and fetches. It does NOT validate availability —
 * that is the domain's job (ADR 0008). Callers must check availability before creating.
 *
 * Ids are generated with a monotonic counter so tests are deterministic.
 */
import type { Booking } from '../domain'
import type { BookingRepository, NewBooking } from './types'

export class InMemoryBookingRepository implements BookingRepository {
  private readonly bookings: Booking[] = []
  private nextId = 1

  constructor(seed: Booking[] = []) {
    this.bookings.push(...seed)
    const maxSeed = seed
      .map((b) => Number.parseInt(b.id.replace(/\D/g, ''), 10))
      .filter((n) => Number.isFinite(n))
    if (maxSeed.length > 0) this.nextId = Math.max(...maxSeed) + 1
  }

  async listByApartment(apartmentId: string): Promise<Booking[]> {
    return this.bookings.filter((b) => b.apartmentId === apartmentId)
  }

  async create(input: NewBooking): Promise<Booking> {
    const booking: Booking = {
      id: `booking-${this.nextId++}`,
      apartmentId: input.apartmentId,
      range: input.range,
      guestEmail: input.guestEmail,
      status: 'requested',
      createdAt: new Date().toISOString(),
    }
    this.bookings.push(booking)
    return booking
  }
}
