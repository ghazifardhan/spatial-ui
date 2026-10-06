import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { DEFAULT_RADIUS, FRAME_PADDING, computeBounds, frameDistance } from './framing'

describe('framing.frameDistance', () => {
  it('grows with radius', () => {
    expect(frameDistance(2, 50)).toBeGreaterThan(frameDistance(1, 50))
  })

  it('grows as the field of view narrows', () => {
    expect(frameDistance(2, 30)).toBeGreaterThan(frameDistance(2, 90))
  })

  it('produces a positive distance for a valid radius', () => {
    expect(frameDistance(3, 50)).toBeGreaterThan(0)
  })

  it('falls back to a safe distance for a non-positive radius', () => {
    expect(frameDistance(0, 50)).toBeGreaterThan(0)
    expect(frameDistance(-5, 50)).toBeCloseTo(frameDistance(DEFAULT_RADIUS, 50), 5)
  })

  it('fits the sphere within the vertical FOV (with padding)', () => {
    const radius = 2
    const fov = 50
    const distance = frameDistance(radius, fov)
    // A sphere at this distance subtends a half-angle of at most half the FOV.
    const halfAngle = Math.asin(radius / distance)
    expect(halfAngle).toBeLessThanOrEqual(THREE.MathUtils.degToRad(fov) / 2 + 1e-9)
    // And the padding is actually applied.
    expect(distance).toBeCloseTo((radius * FRAME_PADDING) / Math.sin(THREE.MathUtils.degToRad(fov) / 2), 5)
  })
})

describe('framing.computeBounds', () => {
  it('measures a single positioned box', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2))
    mesh.position.set(0, 0, 0)
    const { center, radius } = computeBounds(mesh)
    expect(center.length()).toBeCloseTo(0, 5)
    // Half-diagonal of a 2x2x2 box.
    expect(radius).toBeCloseTo(Math.sqrt(3), 5)
  })

  it('spans multiple children', () => {
    const group = new THREE.Group()
    const a = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    a.position.set(-3, 0, 0)
    const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    b.position.set(3, 0, 0)
    group.add(a, b)
    const { center, radius } = computeBounds(group)
    expect(center.x).toBeCloseTo(0, 5)
    expect(radius).toBeGreaterThan(3)
  })

  it('returns a safe default for an empty scene', () => {
    const { center, radius } = computeBounds(new THREE.Group())
    expect(radius).toBe(DEFAULT_RADIUS)
    expect(center.length()).toBe(0)
  })
})
