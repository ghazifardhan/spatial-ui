/**
 * domain — Module #1
 *
 * The foundation module: pure types and pure rules that every other module depends on.
 * `domain` depends on nothing. ADR 0009.
 *
 * Interface surface (everything a caller needs to know):
 *   - Types: DateRange, ApartmentSchema, Apartment, Booking, ...
 *   - Pure rules: date handling (`dates`), availability (`availability`).
 *
 * No I/O, no async, no rendering. Everything here is trivially testable.
 */

export * from './date-range'
export * from './apartment'
export * from './booking'
export * from './dates'
export * as availability from './availability'
