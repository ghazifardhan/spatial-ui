import { describe, expect, it } from 'vitest'
import { InMemoryBookingRepository } from './in-memory-booking-repository'
import type { Booking } from '../domain'

const seed: Booking[] = [
  {
    id: 'booking-7',
    apartmentId: 'apt-studio-01',
    range: { start: '2025-01-10', end: '2025-01-12' },
    guestEmail: 'a@example.com',
    status: 'confirmed',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
]

describe('InMemoryBookingRepository', () => {
  it('lists bookings scoped to one apartment', async () => {
    const repo = new InMemoryBookingRepository(seed)
    const forStudio = await repo.listByApartment('apt-studio-01')
    expect(forStudio).toHaveLength(1)
    const forOther = await repo.listByApartment('apt-2br-01')
    expect(forOther).toHaveLength(0)
  })

  it('creates a booking with status requested and generated id/createdAt', async () => {
    const repo = new InMemoryBookingRepository()
    const created = await repo.create({
      apartmentId: 'apt-2br-01',
      range: { start: '2025-05-01', end: '2025-05-03' },
      guestEmail: 'guest@example.com',
    })
    expect(created.status).toBe('requested')
    expect(created.id).toMatch(/^booking-\d+$/)
    expect(created.createdAt).toMatch(/^\d{4}-/)
    expect(await repo.listByApartment('apt-2br-01')).toContainEqual(created)
  })

  it('continues numbering after a seeded booking id', async () => {
    const repo = new InMemoryBookingRepository(seed)
    const created = await repo.create({
      apartmentId: 'apt-studio-01',
      range: { start: '2025-06-01', end: '2025-06-02' },
      guestEmail: 'guest@example.com',
    })
    expect(created.id).toBe('booking-8')
  })

  it('does not itself enforce availability (dumb data seam, ADR 0008)', async () => {
    // Two overlapping bookings can coexist at the repository level; the domain decides validity.
    const repo = new InMemoryBookingRepository()
    const range = { start: '2025-05-01', end: '2025-05-03' }
    await repo.create({ apartmentId: 'x', range, guestEmail: 'a@example.com' })
    await repo.create({ apartmentId: 'x', range, guestEmail: 'b@example.com' })
    expect(await repo.listByApartment('x')).toHaveLength(2)
  })
})
