import { describe, expect, it } from 'vitest'
import { InMemoryApartmentRepository } from './in-memory-apartment-repository'
import { APARTMENT_FIXTURES } from './fixtures'

describe('InMemoryApartmentRepository', () => {
  it('lists all seeded apartments', async () => {
    const repo = new InMemoryApartmentRepository(APARTMENT_FIXTURES)
    const all = await repo.list()
    expect(all).toHaveLength(APARTMENT_FIXTURES.length)
    expect(all.map((a) => a.id)).toContain('apt-studio-01')
  })

  it('finds an apartment by id', async () => {
    const repo = new InMemoryApartmentRepository(APARTMENT_FIXTURES)
    const found = await repo.findById('apt-studio-01')
    expect(found?.name).toMatch(/studio/i)
  })

  it('resolves null for a missing id (ADR 0016)', async () => {
    const repo = new InMemoryApartmentRepository(APARTMENT_FIXTURES)
    await expect(repo.findById('does-not-exist')).resolves.toBeNull()
  })

  it('does not expose its internal array (list returns a copy)', async () => {
    const seed = [...APARTMENT_FIXTURES]
    const repo = new InMemoryApartmentRepository(seed)
    const first = await repo.list()
    first.pop()
    const second = await repo.list()
    expect(second).toHaveLength(seed.length)
  })
})
