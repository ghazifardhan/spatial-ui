/**
 * validation — pure validation + message mapping for the booking flow (ADR 0033).
 *
 * Interface (what a caller must know):
 *   - `isValidEmail` is a pragmatic format check (not RFC-complete) — enough to catch typos.
 *   - `messageForReason` maps a domain `UnavailableReason` (ADR 0008) to user-facing copy.
 *   - `validateBookingForm` runs the ordered guards (email → range → availability) and returns a
 *     discriminated result, so the component can render either an error or proceed.
 *
 * Pure: no I/O, no React. Testable directly.
 */

import type { Apartment, DateRange } from '../domain'
import { availability, nights } from '../domain'
import type { Booking } from '../domain'

export interface BookingFormInput {
  email: string
  range: DateRange
}

export type BookingValidation =
  | { ok: true }
  | { ok: false; field: 'email' | 'range' | 'availability'; message: string }

export interface ValidateContext {
  apartment: Apartment
  /** Existing bookings on the apartment (already fetched). */
  bookings: readonly { range: DateRange }[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

/** Map a domain unavailability reason to a short, user-facing message. */
export function messageForReason(reason: availability.UnavailableReason): string {
  switch (reason) {
    case 'invalid-range':
      return 'Please choose a valid date range (the end date must be on or after the start date).'
    case 'blacked-out':
      return 'The unit is unavailable for part of that period.'
    case 'already-booked':
      return 'The unit is already booked for part of that period.'
    default: {
      const exhaustive: never = reason
      return String(exhaustive)
    }
  }
}

/**
 * Run the ordered guards for a booking submission.
 * Order: email format → range validity (non-empty) → availability.
 */
export function validateBookingForm(
  input: BookingFormInput,
  context: ValidateContext,
): BookingValidation {
  if (!isValidEmail(input.email)) {
    return { ok: false, field: 'email', message: 'Enter a valid email address.' }
  }

  const { range } = input
  if (!range.start || !range.end) {
    return { ok: false, field: 'range', message: 'Choose both a start and an end date.' }
  }
  if (range.end < range.start) {
    return { ok: false, field: 'range', message: messageForReason('invalid-range') }
  }

  const result = availability.check({
    requested: range,
    blackouts: context.apartment.unavailableDates,
    bookings: context.bookings,
  })
  if (!result.available) {
    return {
      ok: false,
      field: 'availability',
      message: messageForReason(result.reason),
    }
  }

  return { ok: true }
}

/** A booking confirmation summary for display after a successful create. */
export interface BookingConfirmation {
  id: string
  email: string
  range: DateRange
  nights: number
  status: Booking['status']
}

export function toConfirmation(booking: Booking, email: string): BookingConfirmation {
  return {
    id: booking.id,
    email,
    range: booking.range,
    nights: nights(booking.range),
    status: booking.status,
  }
}
