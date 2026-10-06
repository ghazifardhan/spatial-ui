/**
 * In-memory apartment adapter — satisfies `ApartmentRepository` (ADR 0004, 0015).
 *
 * Constructed with seed data so tests and the app can share the same fixtures (ADR 0014).
 */
import type { Apartment } from '../domain'
import type { ApartmentRepository } from './types'

export class InMemoryApartmentRepository implements ApartmentRepository {
  private readonly apartments: Apartment[]

  constructor(seed: Apartment[]) {
    this.apartments = [...seed]
  }

  async list(): Promise<Apartment[]> {
    return [...this.apartments]
  }

  async findById(id: string): Promise<Apartment | null> {
    return this.apartments.find((a) => a.id === id) ?? null
  }
}
