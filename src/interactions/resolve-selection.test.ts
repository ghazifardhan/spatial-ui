import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { resolveSelection } from './resolve-selection'

describe('resolveSelection', () => {
  it('returns null for null/undefined input', () => {
    expect(resolveSelection(null)).toBeNull()
    expect(resolveSelection(undefined)).toBeNull()
  })

  it('reads roomId from a tagged mesh', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry())
    mesh.userData.roomId = 'r-living'
    expect(resolveSelection(mesh)).toBe('r-living')
  })

  it('walks up to a tagged ancestor when a child is hit', () => {
    const group = new THREE.Group()
    group.userData.roomId = 'r-bath'
    const child = new THREE.Mesh(new THREE.BoxGeometry())
    group.add(child)
    expect(resolveSelection(child)).toBe('r-bath')
  })

  it('returns null for an untagged object (e.g. empty space / the scene group)', () => {
    const untagged = new THREE.Group()
    expect(resolveSelection(untagged)).toBeNull()
  })
})
