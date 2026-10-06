import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createHighlighter } from './highlight'
import { buildScene } from '../scene-gen'
import { APARTMENT_FIXTURES } from '../repository/fixtures'

const studio = APARTMENT_FIXTURES.find((a) => a.id === 'apt-studio-01')!.schema

function meshesOfRoom(scene: THREE.Object3D, roomId: string): THREE.Mesh[] {
  const group = scene.getObjectByName(`room:${roomId}`)!
  const meshes: THREE.Mesh[] = []
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
  })
  return meshes
}

describe('createHighlighter', () => {
  it('swaps every mesh of a room to the tint material', () => {
    const scene = buildScene(studio)
    const highlighter = createHighlighter(scene)
    const before = meshesOfRoom(scene, 'r-main').map((m) => m.material)

    highlighter.highlight('r-main', 'select')

    const after = meshesOfRoom(scene, 'r-main').map((m) => m.material)
    // Materials changed, and are now shared (one tint instance).
    expect(after.every((m) => m === after[0])).toBe(true)
    expect(after[0]).not.toBe(before[0])
  })

  it('restores the exact original materials on clear', () => {
    const scene = buildScene(studio)
    const highlighter = createHighlighter(scene)
    const before = meshesOfRoom(scene, 'r-main').map((m) => m.material)

    highlighter.highlight('r-main', 'select')
    highlighter.clear()

    const after = meshesOfRoom(scene, 'r-main').map((m) => m.material)
    expect(after).toEqual(before)
  })

  it('only highlights one room at a time (new highlight clears the previous)', () => {
    const scene = buildScene(studio)
    const highlighter = createHighlighter(scene)
    const mainOriginals = meshesOfRoom(scene, 'r-main').map((m) => m.material)

    highlighter.highlight('r-main', 'hover')
    highlighter.highlight('r-bath', 'select')

    // r-main must be restored (no longer tinted), r-bath tinted.
    expect(meshesOfRoom(scene, 'r-main').map((m) => m.material)).toEqual(mainOriginals)
    const bath = meshesOfRoom(scene, 'r-bath').map((m) => m.material)
    expect(bath.every((m) => m === bath[0])).toBe(true)
  })

  it('is a no-op when highlighting the same room again', () => {
    const scene = buildScene(studio)
    const highlighter = createHighlighter(scene)
    highlighter.highlight('r-main', 'select')
    const tinted = meshesOfRoom(scene, 'r-main')[0].material

    highlighter.highlight('r-main', 'select')
    expect(meshesOfRoom(scene, 'r-main')[0].material).toBe(tinted)
  })

  it('ignores an unknown room id', () => {
    const scene = buildScene(studio)
    const highlighter = createHighlighter(scene)
    expect(() => highlighter.highlight('nope', 'hover')).not.toThrow()
  })

  it('clears a highlighted room and leaves another untouched', () => {
    const scene = buildScene(studio)
    const highlighter = createHighlighter(scene)
    const bathOriginals = meshesOfRoom(scene, 'r-bath').map((m) => m.material)

    highlighter.highlight('r-main', 'select')
    highlighter.clear()

    expect(meshesOfRoom(scene, 'r-bath').map((m) => m.material)).toEqual(bathOriginals)
  })
})
