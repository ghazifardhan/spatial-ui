import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_FURNITURE_SIZE, sizeForType } from './furniture-catalogue'

describe('furniture-catalogue.sizeForType', () => {
  it('returns the catalogue size for a known type', () => {
    expect(sizeForType('bed-double')).toEqual({ width: 1.5, height: 0.5, depth: 2.0 })
  })

  it('falls back to the default size for an unknown type (never throws)', () => {
    expect(sizeForType('hoverboard')).toEqual(DEFAULT_FURNITURE_SIZE)
  })

  it('warns once in dev for an unknown type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    sizeForType('mystery-object')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mystery-object'))
    warn.mockRestore()
  })
})
