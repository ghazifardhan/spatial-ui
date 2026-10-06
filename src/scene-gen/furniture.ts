/**
 * furniture — builds recognizable furniture + room dressing from primitives (ADR 0045).
 *
 * Interface:
 *   - `buildFurniture(placement, roomId, mats)` returns a `THREE.Group` tagged `userData.roomId` +
 *     `userData.kind = 'furniture'`. Parts rest on the floor (lowest part base at y=0).
 *   - Unknown types fall back to one box (never throws, ADR 0020).
 */

import * as THREE from 'three'
import type { ApartmentSchema } from '../domain'
import { sizeForType } from './furniture-catalogue'
import type { MaterialSet } from './palette'

type Placement = ApartmentSchema['furniture'][number]

export function buildFurniture(placement: Placement, roomId: string, mats: MaterialSet): THREE.Group {
  const group = new THREE.Group()
  group.name = `furniture:${placement.id}`
  group.position.set(placement.position.x, placement.position.y, placement.position.z)
  group.rotation.y = placement.rotationY
  group.userData.roomId = roomId
  group.userData.kind = 'furniture'
  group.userData.furnitureType = placement.type
  for (const part of partsFor(placement.type, mats)) group.add(part)
  return group
}

/** Box with its base at `y`, centred at (x, z). */
function box(w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  mesh.position.set(x, y + h / 2, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** Cylinder with its base at `y`. */
function cyl(rTop: number, rBot: number, h: number, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 24), m)
  mesh.position.set(x, y + h / 2, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** Sphere resting at `y` (bottom of sphere at y). */
function ball(r: number, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 16), m)
  mesh.position.set(x, y + r, z)
  mesh.castShadow = true
  return mesh
}

/** Four legs at the corners of a w×d footprint, inset. */
function legs(w: number, d: number, h: number, size: number, m: THREE.Material): THREE.Mesh[] {
  const ix = w / 2 - size
  const iz = d / 2 - size
  return [
    [-ix, -iz],
    [ix, -iz],
    [-ix, iz],
    [ix, iz],
  ].map(([x, z]) => box(size, h, size, m, x, 0, z))
}

function partsFor(type: string, mats: MaterialSet): THREE.Mesh[] {
  const { width: w, height: h, depth: d } = sizeForType(type)

  switch (type) {
    case 'bed-single':
    case 'bed-double':
    case 'bed-queen': {
      const frameH = 0.28
      const matH = 0.22
      const head = box(w + 0.06, 1.0, 0.08, mats.woodDark, 0, 0, -d / 2 + 0.04)
      const frame = box(w, frameH, d, mats.wood)
      const mattress = box(w - 0.06, matH, d - 0.12, mats.mattress, 0, frameH, 0.03)
      const duvet = box(w - 0.02, 0.06, d * 0.62, mats.duvet, 0, frameH + matH, d * 0.18)
      const pillows = w > 1.2
        ? [
            box(w * 0.4, 0.12, 0.38, mats.pillow, -w * 0.23, frameH + matH, -d / 2 + 0.32),
            box(w * 0.4, 0.12, 0.38, mats.pillow, w * 0.23, frameH + matH, -d / 2 + 0.32),
          ]
        : [box(w * 0.7, 0.12, 0.38, mats.pillow, 0, frameH + matH, -d / 2 + 0.32)]
      return [head, frame, mattress, duvet, ...pillows]
    }

    case 'sofa-2':
    case 'sofa-3': {
      const baseH = 0.18
      const seatH = 0.22
      const armW = 0.16
      const base = box(w, baseH, d, mats.woodDark, 0, 0.06)
      const feet = legs(w, d, 0.06, 0.05, mats.woodDark)
      const back = box(w - armW * 2, 0.45, 0.2, mats.fabric, 0, baseH + 0.06, -d / 2 + 0.1)
      const armL = box(armW, 0.42, d, mats.fabric, -w / 2 + armW / 2, 0.06)
      const armR = box(armW, 0.42, d, mats.fabric, w / 2 - armW / 2, 0.06)
      const seats = type === 'sofa-3' ? 3 : 2
      const seatW = (w - armW * 2) / seats
      const cushions = Array.from({ length: seats }, (_, i) =>
        box(seatW - 0.02, seatH, d - 0.24, mats.fabricLight, -w / 2 + armW + seatW * (i + 0.5), baseH + 0.06, 0.1),
      )
      const throwPillow = box(0.38, 0.32, 0.12, mats.duvet, -w / 2 + armW + 0.3, baseH + 0.06 + seatH, -d / 2 + 0.28)
      return [base, ...feet, back, armL, armR, ...cushions, throwPillow]
    }

    case 'coffee-table': {
      const topH = 0.05
      const top = box(w, topH, d, mats.wood, 0, h - topH)
      const shelf = box(w - 0.1, 0.03, d - 0.1, mats.woodDark, 0, 0.1)
      return [top, shelf, ...legs(w, d, h - topH, 0.04, mats.woodDark)]
    }

    case 'nightstand': {
      const body = box(w, h - 0.08, d, mats.wood, 0, 0.08)
      const drawer = box(w - 0.06, 0.02, 0.01, mats.metal, 0, h * 0.6, d / 2)
      const lampBase = cyl(0.06, 0.08, 0.22, mats.ceramic, 0, h)
      const shade = cyl(0.1, 0.14, 0.18, mats.lampShade, 0, h + 0.22)
      return [body, drawer, lampBase, shade, ...legs(w, d, 0.08, 0.03, mats.woodDark)]
    }

    case 'tv-unit': {
      const cabinet = box(w, 0.42, d, mats.wood, 0, 0.08)
      const feet = legs(w, d, 0.08, 0.04, mats.metal)
      const tv = box(w * 0.8, w * 0.45, 0.04, mats.metal, 0, 0.6, -d / 2 + 0.08)
      const screen = box(w * 0.78, w * 0.43, 0.01, mats.countertop, 0, 0.61, -d / 2 + 0.1)
      const stand = box(0.04, 0.1, 0.04, mats.metal, 0, 0.5, -d / 2 + 0.08)
      return [cabinet, ...feet, stand, tv, screen]
    }

    case 'kitchen-counter': {
      const plinth = box(w - 0.05, 0.1, d, mats.woodDark)
      const cabinets = box(w, 0.76, d, mats.cabinet, 0, 0.1)
      const top = box(w + 0.03, 0.04, d + 0.02, mats.countertop, 0, 0.86)
      const sink = box(0.5, 0.02, 0.45, mats.metal, 0, 0.9, -d * 0.2)
      const hob = box(0.5, 0.01, 0.5, mats.woodDark, 0, 0.9, d * 0.25)
      const upper = box(0.35, 0.7, d, mats.cabinet, -w / 2 + 0.175, 1.5)
      const handles = Array.from({ length: 4 }, (_, i) =>
        box(0.01, 0.02, 0.18, mats.metal, w / 2 + 0.005, 0.72, -d / 2 + d * (i + 0.5) / 4),
      )
      return [plinth, cabinets, top, sink, hob, upper, ...handles]
    }

    case 'fridge': {
      const body = box(w, h, d, mats.porcelain)
      const seam = box(w + 0.002, 0.01, d * 0.98, mats.metal, 0, h * 0.62)
      const handle = box(0.02, 0.5, 0.03, mats.metal, w * 0.35, h * 0.68, d / 2 + 0.015)
      return [body, seam, handle]
    }

    case 'wardrobe': {
      const body = box(w, h, d, mats.cabinet)
      const split = box(0.01, h * 0.96, 0.005, mats.woodDark, 0, h * 0.02, d / 2)
      const handleL = box(0.02, 0.3, 0.02, mats.metal, -0.05, h * 0.45, d / 2 + 0.01)
      const handleR = box(0.02, 0.3, 0.02, mats.metal, 0.05, h * 0.45, d / 2 + 0.01)
      return [body, split, handleL, handleR]
    }

    case 'bookshelf': {
      const sides = [box(0.03, h, d, mats.wood, -w / 2 + 0.015), box(0.03, h, d, mats.wood, w / 2 - 0.015)]
      const shelves = Array.from({ length: 5 }, (_, i) => box(w, 0.03, d, mats.wood, 0, (h - 0.03) * (i / 4)))
      const books = [0.2, 0.55, 0.9, 1.25].flatMap((y, i) => [
        box(0.18, 0.24, d * 0.8, i % 2 ? mats.fabric : mats.duvet, -w * 0.25, y + 0.03),
        box(0.14, 0.22, d * 0.8, i % 2 ? mats.pot : mats.fabricLight, w * 0.15, y + 0.03),
      ])
      return [...sides, ...shelves, ...books]
    }

    case 'dining-set': {
      const top = box(w, 0.04, d, mats.wood, 0, h - 0.04)
      const tableLegs = legs(w, d, h - 0.04, 0.05, mats.woodDark)
      const chairs = [
        [-w * 0.25, -d / 2 - 0.25, 0],
        [w * 0.25, -d / 2 - 0.25, 0],
        [-w * 0.25, d / 2 + 0.25, Math.PI],
        [w * 0.25, d / 2 + 0.25, Math.PI],
      ].flatMap(([x, z, rot]) => chair(mats, x, z, rot))
      const vase = cyl(0.05, 0.07, 0.2, mats.ceramic, 0, h)
      const stems = ball(0.09, mats.foliage, 0, h + 0.18)
      return [top, ...tableLegs, ...chairs, vase, stems]
    }

    case 'dining-chair':
      return chair(mats, 0, 0, 0)

    case 'sink': {
      const vanity = box(w, h - 0.05, d, mats.cabinet)
      const basin = box(w * 0.8, 0.05, d * 0.8, mats.porcelain, 0, h - 0.05)
      const tap = cyl(0.015, 0.015, 0.18, mats.metal, 0, h, -d * 0.3)
      const mirror = box(w * 0.9, 0.7, 0.02, mats.glass, 0, h + 0.3, -d / 2 + 0.01)
      return [vanity, basin, tap, mirror]
    }

    case 'toilet': {
      const base = cyl(0.16, 0.2, h, mats.porcelain, 0, 0, 0.08)
      const seat = box(w, 0.04, d * 0.6, mats.porcelain, 0, h, 0.1)
      const tank = box(w, 0.4, 0.18, mats.porcelain, 0, h - 0.05, -d / 2 + 0.09)
      return [base, seat, tank]
    }

    case 'shower': {
      const tray = box(w, 0.05, d, mats.porcelain)
      const glassSide = box(0.01, h - 0.05, d, mats.glass, w / 2, 0.05)
      const glassFront = box(w, h - 0.05, 0.01, mats.glass, 0, 0.05, d / 2)
      const head = cyl(0.08, 0.08, 0.02, mats.metal, -w * 0.3, h - 0.2, -d * 0.3)
      const pipe = box(0.02, h - 0.3, 0.02, mats.metal, -w * 0.3, 0.1, -d / 2 + 0.02)
      glassSide.castShadow = false
      glassFront.castShadow = false
      return [tray, glassSide, glassFront, pipe, head]
    }

    case 'rug': {
      const rug = box(w, h, d, mats.rug)
      const border = box(w - 0.2, h + 0.002, d - 0.2, mats.floorAccent)
      rug.castShadow = false
      border.castShadow = false
      return [rug, border]
    }

    case 'plant': {
      const pot = cyl(0.17, 0.13, 0.35, mats.pot)
      const soil = cyl(0.16, 0.16, 0.02, mats.woodDark, 0, 0.33)
      const stem = cyl(0.02, 0.02, 0.35, mats.woodDark, 0, 0.35)
      const leaves = [
        ball(0.22, mats.foliage, 0, 0.6),
        ball(0.17, mats.foliage, 0.12, 0.82, 0.05),
        ball(0.15, mats.foliage, -0.1, 0.78, -0.06),
      ]
      return [pot, soil, stem, ...leaves]
    }

    case 'floor-lamp': {
      const base = cyl(0.15, 0.17, 0.03, mats.metal)
      const pole = cyl(0.015, 0.015, h - 0.35, mats.metal, 0, 0.03)
      const shade = cyl(0.14, 0.2, 0.3, mats.lampShade, 0, h - 0.32)
      return [base, pole, shade]
    }

    case 'wall-art': {
      const frame = box(w, h, d, mats.woodDark)
      const canvas = box(w - 0.08, h - 0.08, 0.01, mats.duvet, 0, 0.04, d / 2)
      const accent = box((w - 0.08) * 0.5, (h - 0.08) * 0.4, 0.012, mats.pot, -w * 0.1, h * 0.35, d / 2)
      return [frame, canvas, accent]
    }

    default:
      return [box(w, h, d, mats.fabric)]
  }
}

/** A dining chair: seat, back, four legs. Positioned and rotated within the parent. */
function chair(mats: MaterialSet, x: number, z: number, rot: number): THREE.Mesh[] {
  const pivot = new THREE.Group()
  const seatH = 0.45
  const parts = [
    box(0.42, 0.04, 0.42, mats.wood, 0, seatH),
    box(0.42, 0.42, 0.03, mats.wood, 0, seatH + 0.04, -0.2),
    ...legs(0.42, 0.42, seatH, 0.03, mats.woodDark),
  ]
  // Bake the chair's local transform into each part so the caller receives flat meshes.
  pivot.position.set(x, 0, z)
  pivot.rotation.y = rot
  pivot.updateMatrixWorld(true)
  for (const p of parts) {
    p.applyMatrix4(pivot.matrixWorld)
  }
  return parts
}
