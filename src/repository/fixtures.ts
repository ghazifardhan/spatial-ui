/**
 * fixtures — hand-authored Apartment data (ADR 0014), reworked for realistic layouts (ADR 0042).
 *
 * Layouts place rooms FLUSH against their neighbours so shared boundaries deduplicate to a single
 * wall (ADR 0042). These double as TEST data and DEMO data.
 *
 * Coordinate reminders (ADR 0007):
 *   - Meters, Y-up, right-handed. Each unit's origin is at its entrance.
 *   - A room's rect `{ x, z, w, d }`: `(x, z)` is the near corner; `w` extends +X, `d` extends +Z.
 *   - Wall sides: north = min Z, south = max Z, west = min X, east = max X.
 *   - A furniture position's `y` is the item's base (0 = floor).
 */

import type { Apartment } from '../domain'

/**
 * Studio — one open living/sleeping room with a bathroom tucked into the corner. Front door on the
 * south wall; big window on the north; the bathroom door shares the room's east band.
 *
 * Layout (top-down, +X right, +Z down):
 *   ┌───────────────┬───────┐
 *   │   LIVING      │ BATH  │   bath: x 4.5..7.0, z 0..2.5
 *   │  x0..4.5      │x4.5..7│   living: x 0..4.5, z 0..5.5
 *   │  z0..5.5      ├───────┤
 *   │               │       │
 *   └───────────────┴───────┘
 */
const studio: Apartment = {
  id: 'apt-studio-01',
  name: 'Sunlit Downtown Studio',
  nightlyPriceMinor: 850_000, // 850,000 IDR
  currency: 'IDR',
  unavailableDates: [{ start: '2025-02-10', end: '2025-02-12' }],
  schema: {
    id: 'apt-studio-01',
    rooms: [
      { id: 'r-main', name: 'Living & Sleeping', rect: { x: 0, z: 0, w: 4.5, d: 5.5 }, ceilingHeight: 2.85 },
      { id: 'r-bath', name: 'Bathroom', rect: { x: 4.5, z: 0, w: 2.5, d: 2.5 }, ceilingHeight: 2.4 },
    ],
    openings: [
      { id: 'o-door', room: 'r-main', wall: 'south', offset: 1.6, width: 0.95, sillHeight: 0, height: 2.1 },
      // Wide north window is the room's signature.
      { id: 'o-window', room: 'r-main', wall: 'north', offset: 0.6, width: 3.2, sillHeight: 0.7, height: 1.5 },
      // Window in the bathroom.
      { id: 'o-bathwin', room: 'r-bath', wall: 'north', offset: 0.6, width: 1.2, sillHeight: 1.1, height: 1.0 },
      // Door into the bathroom, on the shared wall (west side of bathroom = east side of living).
      { id: 'o-bathdoor', room: 'r-bath', wall: 'west', offset: 0.9, width: 0.8, sillHeight: 0, height: 2.05 },
      { id: 'o-livingwin', room: 'r-main', wall: 'west', offset: 1.4, width: 1.6, sillHeight: 0.9, height: 1.3 },
    ],
    furniture: [
      { id: 'f-rug', type: 'rug', room: 'r-main', position: { x: 2.4, y: 0, z: 2.3 }, rotationY: 0 },
      { id: 'f-bed', type: 'bed-double', room: 'r-main', position: { x: 2.2, y: 0, z: 0.95 }, rotationY: 0 },
      { id: 'f-nightstand', type: 'nightstand', room: 'r-main', position: { x: 3.7, y: 0, z: 0.5 }, rotationY: 0 },
      { id: 'f-sofa', type: 'sofa-2', room: 'r-main', position: { x: 2.4, y: 0, z: 4.5 }, rotationY: Math.PI },
      { id: 'f-table', type: 'coffee-table', room: 'r-main', position: { x: 2.4, y: 0, z: 3.2 }, rotationY: 0 },
      { id: 'f-tv', type: 'tv-unit', room: 'r-main', position: { x: 0.45, y: 0, z: 2.95 }, rotationY: Math.PI / 2 },
      { id: 'f-art', type: 'wall-art', room: 'r-main', position: { x: 2.2, y: 1.5, z: 0.12 }, rotationY: 0 },
      { id: 'f-plant', type: 'plant', room: 'r-main', position: { x: 4.1, y: 0, z: 4.9 }, rotationY: 0 },
      { id: 'f-lamp', type: 'floor-lamp', room: 'r-main', position: { x: 0.6, y: 0, z: 4.9 }, rotationY: 0 },
      { id: 'f-sink', type: 'sink', room: 'r-bath', position: { x: 5.2, y: 0, z: 0.35 }, rotationY: 0 },
      { id: 'f-toilet', type: 'toilet', room: 'r-bath', position: { x: 6.5, y: 0, z: 0.5 }, rotationY: 0 },
      { id: 'f-shower', type: 'shower', room: 'r-bath', position: { x: 6.3, y: 0, z: 1.85 }, rotationY: 0 },
    ],
  },
}

/**
 * Two-bedroom — living + kitchen along the front, two bedrooms and a bathroom along the back. All
 * rooms are flush so shared walls deduplicate.
 *
 * Layout (+X right, +Z down):
 *   ┌───────────────┬───────┐
 *   │   LIVING      │KITCHEN│   z 0..4.6
 *   ├───────────┬───┴───┬───┤
 *   │  BED 1    │ BED 2 │BATH│  z 4.6..9.0
 *   └───────────┴───────┴───┘
 *     x0..4.2    4.2..7.8 7.8..10.6
 */
const twoBedroom: Apartment = {
  id: 'apt-2br-01',
  name: 'Riverside Two-Bedroom',
  nightlyPriceMinor: 1_650_000,
  currency: 'IDR',
  unavailableDates: [
    { start: '2025-03-01', end: '2025-03-03' },
    { start: '2025-04-20', end: '2025-04-25' },
  ],
  schema: {
    id: 'apt-2br-01',
    rooms: [
      { id: 'r-living', name: 'Living Room', rect: { x: 0, z: 0, w: 6.0, d: 4.6 }, ceilingHeight: 2.9 },
      { id: 'r-kitchen', name: 'Kitchen', rect: { x: 6.0, z: 0, w: 4.6, d: 4.6 }, ceilingHeight: 2.9 },
      { id: 'r-bed1', name: 'Master Bedroom', rect: { x: 0, z: 4.6, w: 4.2, d: 4.4 }, ceilingHeight: 2.75 },
      { id: 'r-bed2', name: 'Second Bedroom', rect: { x: 4.2, z: 4.6, w: 3.6, d: 4.4 }, ceilingHeight: 2.75 },
      { id: 'r-bath', name: 'Bathroom', rect: { x: 7.8, z: 4.6, w: 2.8, d: 4.4 }, ceilingHeight: 2.4 },
    ],
    openings: [
      { id: 'o-front', room: 'r-living', wall: 'south', offset: 2.2, width: 1.05, sillHeight: 0, height: 2.15 },
      { id: 'o-win-living', room: 'r-living', wall: 'south', offset: 3.6, width: 2.0, sillHeight: 0.8, height: 1.4 },
      { id: 'o-win-kitchen', room: 'r-kitchen', wall: 'east', offset: 1.2, width: 2.0, sillHeight: 0.95, height: 1.3 },
      { id: 'o-door-bed1', room: 'r-bed1', wall: 'north', offset: 1.5, width: 0.9, sillHeight: 0, height: 2.1 },
      { id: 'o-win-bed1', room: 'r-bed1', wall: 'west', offset: 1.4, width: 1.8, sillHeight: 0.85, height: 1.35 },
      { id: 'o-door-bed2', room: 'r-bed2', wall: 'north', offset: 1.3, width: 0.9, sillHeight: 0, height: 2.1 },
      { id: 'o-door-bath', room: 'r-bath', wall: 'north', offset: 1.0, width: 0.85, sillHeight: 0, height: 2.05 },
      { id: 'o-win-bath', room: 'r-bath', wall: 'east', offset: 1.6, width: 1.1, sillHeight: 1.2, height: 1.0 },
    ],
    furniture: [
      { id: 'f-rug', type: 'rug', room: 'r-living', position: { x: 3.0, y: 0, z: 2.4 }, rotationY: 0 },
      { id: 'f-sofa', type: 'sofa-3', room: 'r-living', position: { x: 3.0, y: 0, z: 0.9 }, rotationY: 0 },
      { id: 'f-table', type: 'coffee-table', room: 'r-living', position: { x: 3.0, y: 0, z: 2.4 }, rotationY: 0 },
      { id: 'f-tv', type: 'tv-unit', room: 'r-living', position: { x: 3.0, y: 0, z: 3.95 }, rotationY: Math.PI },
      { id: 'f-dining', type: 'dining-set', room: 'r-kitchen', position: { x: 8.2, y: 0, z: 1.6 }, rotationY: 0 },
      { id: 'f-counter', type: 'kitchen-counter', room: 'r-kitchen', position: { x: 6.45, y: 0, z: 2.4 }, rotationY: 0 },
      { id: 'f-fridge', type: 'fridge', room: 'r-kitchen', position: { x: 10.2, y: 0, z: 0.55 }, rotationY: 0 },
      { id: 'f-bed1', type: 'bed-queen', room: 'r-bed1', position: { x: 2.1, y: 0, z: 6.05 }, rotationY: 0 },
      { id: 'f-nightstand1', type: 'nightstand', room: 'r-bed1', position: { x: 3.5, y: 0, z: 5.4 }, rotationY: 0 },
      { id: 'f-wardrobe1', type: 'wardrobe', room: 'r-bed1', position: { x: 0.45, y: 0, z: 8.4 }, rotationY: Math.PI / 2 },
      { id: 'f-art1', type: 'wall-art', room: 'r-bed1', position: { x: 2.1, y: 1.6, z: 4.72 }, rotationY: 0 },
      { id: 'f-bed2', type: 'bed-single', room: 'r-bed2', position: { x: 5.5, y: 0, z: 6.0 }, rotationY: 0 },
      { id: 'f-nightstand2', type: 'nightstand', room: 'r-bed2', position: { x: 6.6, y: 0, z: 5.4 }, rotationY: 0 },
      { id: 'f-wardrobe2', type: 'wardrobe', room: 'r-bed2', position: { x: 7.4, y: 0, z: 8.5 }, rotationY: Math.PI / 2 },
      { id: 'f-plant2', type: 'plant', room: 'r-bed2', position: { x: 4.5, y: 0, z: 8.4 }, rotationY: 0 },
      { id: 'f-shower', type: 'shower', room: 'r-bath', position: { x: 8.3, y: 0, z: 5.1 }, rotationY: 0 },
      { id: 'f-sink', type: 'sink', room: 'r-bath', position: { x: 9.9, y: 0, z: 5.1 }, rotationY: 0 },
      { id: 'f-toilet', type: 'toilet', room: 'r-bath', position: { x: 9.9, y: 0, z: 8.5 }, rotationY: 0 },
    ],
  },
}

/** All seeded apartments, in the order they appear in listings. */
export const APARTMENT_FIXTURES: Apartment[] = [studio, twoBedroom]
