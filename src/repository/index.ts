/**
 * repository — Module #2 interface surface.
 *
 * Callers import from here: the interfaces, the composition root, and (for tests/demo) fixtures.
 * The concrete in-memory classes are intentionally NOT exported — callers depend on interfaces
 * (ADR 0004).
 */
export type {
  ApartmentRepository,
  BookingRepository,
  NewBooking,
} from './types'
export { createInMemoryRepositories, type Repositories } from './create-repositories'
export { APARTMENT_FIXTURES } from './fixtures'
