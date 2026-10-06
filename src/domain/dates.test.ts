import { describe, expect, it } from 'vitest'
import {
  addDays,
  daysBetween,
  fromEpochDay,
  nights,
  rangesOverlap,
  toEpochDay,
} from './dates'

describe('dates', () => {
  describe('toEpochDay / fromEpochDay', () => {
    it('round-trips a valid ISO date', () => {
      expect(fromEpochDay(toEpochDay('2025-03-15'))).toBe('2025-03-15')
    })

    it('treats a day as exactly 86400000ms regardless of month boundaries', () => {
      expect(toEpochDay('2025-03-01') - toEpochDay('2025-02-28')).toBe(86_400_000)
    })

    it('throws on malformed input (fail fast at the seam)', () => {
      expect(() => toEpochDay('2025-3-1')).toThrow(/Invalid ISO date/)
      expect(() => toEpochDay('not-a-date')).toThrow(/Invalid ISO date/)
      expect(() => toEpochDay('')).toThrow(/Invalid ISO date/)
    })
  })

  describe('daysBetween', () => {
    it('is positive when the first date is later', () => {
      expect(daysBetween('2025-01-10', '2025-01-01')).toBe(9)
    })

    it('is negative when the first date is earlier', () => {
      expect(daysBetween('2025-01-01', '2025-01-10')).toBe(-9)
    })

    it('is zero for equal dates', () => {
      expect(daysBetween('2025-01-01', '2025-01-01')).toBe(0)
    })
  })

  describe('addDays', () => {
    it('adds across a month boundary', () => {
      expect(addDays('2025-01-31', 1)).toBe('2025-02-01')
    })

    it('subtracts with a negative number', () => {
      expect(addDays('2025-03-01', -1)).toBe('2025-02-28')
    })

    it('handles leap years', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    })
  })

  describe('nights', () => {
    it('counts inclusive nights', () => {
      expect(nights({ start: '2025-01-01', end: '2025-01-03' })).toBe(3)
    })

    it('counts a single day as one night', () => {
      expect(nights({ start: '2025-01-01', end: '2025-01-01' })).toBe(1)
    })

    it('returns 0 for an inverted range', () => {
      expect(nights({ start: '2025-01-05', end: '2025-01-01' })).toBe(0)
    })
  })

  describe('rangesOverlap', () => {
    it('detects containment', () => {
      expect(rangesOverlap({ start: '2025-01-01', end: '2025-01-10' }, { start: '2025-01-03', end: '2025-01-05' })).toBe(true)
    })

    it('detects partial overlap', () => {
      expect(rangesOverlap({ start: '2025-01-01', end: '2025-01-05' }, { start: '2025-01-03', end: '2025-01-08' })).toBe(true)
    })

    it('detects a single shared day', () => {
      expect(rangesOverlap({ start: '2025-01-01', end: '2025-01-05' }, { start: '2025-01-05', end: '2025-01-08' })).toBe(true)
    })

    it('treats touching-but-not-sharing ranges as non-overlapping', () => {
      expect(rangesOverlap({ start: '2025-01-01', end: '2025-01-05' }, { start: '2025-01-06', end: '2025-01-10' })).toBe(false)
    })

    it('treats disjoint ranges as non-overlapping', () => {
      expect(rangesOverlap({ start: '2025-01-01', end: '2025-01-05' }, { start: '2025-02-01', end: '2025-02-05' })).toBe(false)
    })
  })
})
