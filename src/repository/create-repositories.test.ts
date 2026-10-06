import { describe, expect, it } from 'vitest'
import { createInMemoryRepositories } from './create-repositories'

describe('createInMemoryRepositories', () => {
  it('returns a wired apartments + bookings repository over the fixtures', async () => {
    const repos = createInMemoryRepositories()
    const apartments = await repos.apartments.list()
    expect(apartments.length).toBeGreaterThan(0)

    const first = apartments[0]
    const created = await repos.bookings.create({
      apartmentId: first.id,
      range: { start: '2025-07-01', end: '2025-07-02' },
      guestEmail: 'guest@example.com',
    })
    expect(created.apartmentId).toBe(first.id)
    expect(await repos.bookings.listByApartment(first.id)).toContainEqual(created)
  })
})
