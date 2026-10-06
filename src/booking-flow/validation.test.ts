import { describe, expect, it } from 'vitest'
import {
  isValidEmail,
  messageForReason,
  toConfirmation,
  validateBookingForm,
} from './validation'
import type { Apartment, Booking } from '../domain'

const apartment: Apartment = {
  id: 'apt-1',
  name: 'Test Unit',
  nightlyPriceMinor: 100_000,
  currency: 'IDR',
  unavailableDates: [{ start: '2025-02-10', end: '2025-02-12' }],
  schema: { id: 'apt-1', rooms: [], openings: [], furniture: [] },
}

const range = (start: string, end: string) => ({ start, end })

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
  })
  it('trims surrounding whitespace', () => {
    expect(isValidEmail('  a@b.co  ')).toBe(true)
  })
  it('rejects obvious malformations', () => {
    expect(isValidEmail('a@b')).toBe(false)
    expect(isValidEmail('a b@c.co')).toBe(false)
    expect(isValidEmail('@b.co')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('messageForReason', () => {
  it('maps each reason to distinct copy', () => {
    const messages = new Set([
      messageForReason('invalid-range'),
      messageForReason('blacked-out'),
      messageForReason('already-booked'),
    ])
    expect(messages.size).toBe(3)
  })
})

describe('validateBookingForm', () => {
  it('fails on a bad email first', () => {
    const result = validateBookingForm(
      { email: 'nope', range: range('2025-01-01', '2025-01-03') },
      { apartment, bookings: [] },
    )
    expect(result).toEqual({ ok: false, field: 'email', message: expect.any(String) })
  })

  it('fails when a date is missing', () => {
    const result = validateBookingForm(
      { email: 'a@b.co', range: range('', '2025-01-03') },
      { apartment, bookings: [] },
    )
    expect(result).toMatchObject({ ok: false, field: 'range' })
  })

  it('fails on an inverted range', () => {
    const result = validateBookingForm(
      { email: 'a@b.co', range: range('2025-01-05', '2025-01-01') },
      { apartment, bookings: [] },
    )
    expect(result).toMatchObject({ ok: false, field: 'range' })
  })

  it('fails when the range hits a blackout', () => {
    const result = validateBookingForm(
      { email: 'a@b.co', range: range('2025-02-11', '2025-02-13') },
      { apartment, bookings: [] },
    )
    expect(result).toMatchObject({ ok: false, field: 'availability' })
    if (!result.ok) expect(result.message).toMatch(/unavailable/i)
  })

  it('fails when the range hits an existing booking', () => {
    const bookings: { range: Booking['range'] }[] = [
      { range: range('2025-03-01', '2025-03-05') },
    ]
    const result = validateBookingForm(
      { email: 'a@b.co', range: range('2025-03-04', '2025-03-06') },
      { apartment, bookings },
    )
    expect(result).toMatchObject({ ok: false, field: 'availability' })
    if (!result.ok) expect(result.message).toMatch(/already booked/i)
  })

  it('passes for a valid, available request (touching a blackout boundary is fine)', () => {
    const result = validateBookingForm(
      { email: 'a@b.co', range: range('2025-02-13', '2025-02-15') },
      { apartment, bookings: [] },
    )
    expect(result).toEqual({ ok: true })
  })
})

describe('toConfirmation', () => {
  it('projects a booking + email into a display summary', () => {
    const booking: Booking = {
      id: 'booking-3',
      apartmentId: 'apt-1',
      range: range('2025-05-01', '2025-05-03'),
      guestEmail: 'a@b.co',
      status: 'requested',
      createdAt: '2025-04-01T00:00:00.000Z',
    }
    const confirmation = toConfirmation(booking, 'a@b.co')
    expect(confirmation).toEqual({
      id: 'booking-3',
      email: 'a@b.co',
      range: { start: '2025-05-01', end: '2025-05-03' },
      nights: 3,
      status: 'requested',
    })
  })
})
