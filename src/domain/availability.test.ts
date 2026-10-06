import { describe, expect, it } from 'vitest'
import { check, isAvailable } from './availability'
import type { DateRange } from './date-range'

const jan = (start: number, end: number): DateRange => ({
  start: `2025-01-${String(start).padStart(2, '0')}`,
  end: `2025-01-${String(end).padStart(2, '0')}`,
})

describe('availability', () => {
  describe('check', () => {
    it('is available when nothing conflicts', () => {
      expect(check({ requested: jan(1, 3), blackouts: [], bookings: [] })).toEqual({ available: true })
    })

    it('reports an invalid range rather than throwing', () => {
      const result = check({ requested: { start: '2025-01-05', end: '2025-01-01' }, blackouts: [], bookings: [] })
      expect(result).toEqual({ available: false, reason: 'invalid-range' })
    })

    it('reports blacked-out with the conflicting range', () => {
      const blackout = jan(2, 4)
      const result = check({ requested: jan(1, 3), blackouts: [blackout], bookings: [] })
      expect(result).toEqual({ available: false, reason: 'blacked-out', conflict: blackout })
    })

    it('reports already-booked with the conflicting range', () => {
      const range = jan(2, 4)
      const result = check({ requested: jan(1, 3), blackouts: [], bookings: [{ range }] })
      expect(result).toEqual({ available: false, reason: 'already-booked', conflict: range })
    })

    it('does not treat a touching booking as a conflict', () => {
      // Existing booking Jan 1–2; requested Jan 3–4. They touch but share no day.
      expect(check({ requested: jan(3, 4), blackouts: [], bookings: [{ range: jan(1, 2) }] })).toEqual({ available: true })
    })

    it('prefers the invalid-range reason over other conflicts', () => {
      const result = check({ requested: jan(5, 1), blackouts: [jan(1, 3)], bookings: [{ range: jan(1, 3) }] })
      expect(result).toEqual({ available: false, reason: 'invalid-range' })
    })

    it('prefers blacked-out over already-booked when both conflict', () => {
      const blackout = jan(2, 4)
      const result = check({ requested: jan(1, 3), blackouts: [blackout], bookings: [{ range: jan(2, 4) }] })
      expect(result).toEqual({ available: false, reason: 'blacked-out', conflict: blackout })
    })
  })

  describe('isAvailable', () => {
    it('is the boolean projection of check', () => {
      expect(isAvailable({ requested: jan(1, 3), blackouts: [], bookings: [] })).toBe(true)
      expect(isAvailable({ requested: jan(1, 3), blackouts: [jan(2, 2)], bookings: [] })).toBe(false)
    })
  })
})
