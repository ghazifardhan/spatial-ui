import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { buildScene, roomGroupName, CEILING_GROUP_NAME } from './build-scene'
import { roomIdOf, setCeilingVisible, hasCeiling } from './index'
import { APARTMENT_FIXTURES } from '../repository/fixtures'
import type { ApartmentSchema } from '../domain'

const studio = APARTMENT_FIXTURES.find((a) => a.id === 'apt-studio-01')!.schema

/** All meshes under a group, flattened. */
function meshes(group: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = []
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh)
  })
  return out
}

describe('buildScene', () => {
  it('returns a group named for the schema', () => {
    const group = buildScene(studio)
    expect(group).toBeInstanceOf(THREE.Group)
    expect(group.name).toBe(`apartment:${studio.id}`)
  })

  it('creates one child group per room, named room:<id>', () => {
    const group = buildScene(studio)
    const roomGroups = group.children.filter((c) => c.name.startsWith('room:'))
    expect(roomGroups.map((g) => g.name).sort()).toEqual(
      studio.rooms.map((r) => roomGroupName(r.id)).sort(),
    )
  })

  it('tags every room-owned mesh (directly or via an ancestor) with a roomId in the schema (ADR 0019)', () => {
    const group = buildScene(studio)
    const roomIds = new Set(studio.rooms.map((r) => r.id))
    for (const mesh of meshes(group)) {
      const roomId = roomIdOf(mesh)
      expect(typeof roomId).toBe('string')
      expect(roomIds.has(roomId!)).toBe(true)
    }
  })

  it('adds a ceiling per room, all in one root group (ADR 0040, 0047)', () => {
    const group = buildScene(studio)
    const ceilingGroup = group.getObjectByName(CEILING_GROUP_NAME)
    expect(ceilingGroup).toBeDefined()
    const ceilings: THREE.Mesh[] = []
    ceilingGroup!.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) ceilings.push(o as THREE.Mesh)
    })
    expect(ceilings).toHaveLength(studio.rooms.length)
    expect(ceilings.every((m) => m.userData.kind === 'ceiling')).toBe(true)
  })

  it('toggles ceiling visibility in one lookup without rebuilding (ADR 0047)', () => {
    const group = buildScene(studio)
    expect(hasCeiling(group)).toBe(true)
    expect(setCeilingVisible(group, false)).toBe(true)
    expect(group.getObjectByName(CEILING_GROUP_NAME)!.visible).toBe(false)
    expect(setCeilingVisible(group, true)).toBe(true)
    expect(group.getObjectByName(CEILING_GROUP_NAME)!.visible).toBe(true)
  })

  it('setCeilingVisible returns false when there is no ceiling group', () => {
    expect(setCeilingVisible(new THREE.Group(), true)).toBe(false)
    expect(hasCeiling(new THREE.Group())).toBe(false)
  })

  it('places the floor so its top surface is at y=0', () => {
    const group = buildScene(studio)
    const floors = meshes(group).filter((m) => m.userData.kind === 'floor')
    expect(floors.length).toBe(studio.rooms.length)
    for (const floor of floors) {
      const geom = floor.geometry as THREE.BoxGeometry
      const halfHeight = geom.parameters.height / 2
      // A thin slab centred just below the floor plane.
      expect(floor.position.y).toBeCloseTo(-halfHeight, 5)
    }
  })

  it('builds walls (kind=wall) for every room', () => {
    const group = buildScene(studio)
    const walls = meshes(group).filter((m) => m.userData.kind === 'wall')
    expect(walls.length).toBeGreaterThan(studio.rooms.length)
  })

  it('places floor-standing furniture with its parts resting on the floor (base at y=0)', () => {
    const group = buildScene(studio)
    const wallMounted = new Set(['wall-art'])
    const furnitureGroups = group.children
      .flatMap((room) => room.children)
      .filter((c) => c.userData.kind === 'furniture')
      .filter((c) => !wallMounted.has(c.userData.furnitureType))
    expect(furnitureGroups.length).toBeGreaterThan(0)
    for (const item of furnitureGroups) {
      let minY = Infinity
      item.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        // Compute local-space min Y from any geometry (boxes, cylinders, spheres).
        mesh.geometry.computeBoundingBox()
        const bb = mesh.geometry.boundingBox!
        minY = Math.min(minY, mesh.position.y + bb.min.y)
      })
      // The lowest part of the item sits on the floor.
      expect(minY, `${item.name} minY`).toBeCloseTo(0, 3)
    }
  })

  it('applies furniture rotationY', () => {
    const group = buildScene(studio)
    const sofa = group.getObjectByName('furniture:f-sofa')
    expect(sofa?.rotation.y).toBeCloseTo(Math.PI, 5)
  })

  it('does not mutate the input schema', () => {
    const snapshot = JSON.stringify(studio)
    buildScene(studio)
    expect(JSON.stringify(studio)).toBe(snapshot)
  })

  it('tolerates an unknown furniture type without throwing (ADR 0020)', () => {
    const schema: ApartmentSchema = {
      id: 'x',
      rooms: [{ id: 'r', name: 'R', rect: { x: 0, z: 0, w: 2, d: 2 }, ceilingHeight: 2.5 }],
      openings: [],
      furniture: [
        { id: 'f', type: 'unknown-thing', room: 'r', position: { x: 1, y: 0, z: 1 }, rotationY: 0 },
      ],
    }
    expect(() => buildScene(schema)).not.toThrow()
    const item = buildScene(schema).getObjectByName('furniture:f')
    expect(item).toBeDefined()
  })
})

describe('roomIdOf', () => {
  it('reads the room id from a tagged mesh (directly or via an ancestor)', () => {
    const group = buildScene(studio)
    const mesh = meshes(group).find((m) => m.userData.kind === 'floor')!
    expect(roomIdOf(mesh)).toBe(mesh.userData.roomId)
  })

  it('walks up to a tagged ancestor', () => {
    const parent = new THREE.Object3D()
    parent.userData.roomId = 'r-main'
    const child = new THREE.Object3D()
    parent.add(child)
    expect(roomIdOf(child)).toBe('r-main')
  })

  it('returns null for an untagged object', () => {
    expect(roomIdOf(new THREE.Object3D())).toBeNull()
  })
})
