/**
 * furniture-catalogue — the size table that turns a furniture `type` into placeholder box
 * dimensions (ADR 0020).
 *
 * Interface (what a caller must know):
 *   - Look up by `type`; unknown types fall back to a default box and emit a dev warning rather
 *     than throwing, so one bad fixture entry never blanks a whole scene.
 *   - Sizes are in meters: `width` along X, `height` along Y, `depth` along Z, in the item's own
 *     local frame (rotation is applied by the generator).
 *   - The catalogue is where a glTF model loader would later slot in, keyed by the same `type`.
 */

export interface FurnitureSize {
  width: number
  height: number
  depth: number
}

/** Fallback used for unknown types. Deliberately bland. */
export const DEFAULT_FURNITURE_SIZE: FurnitureSize = { width: 1, height: 1, depth: 1 }

/** Size table for the furniture types used by the fixtures (and a few extras). */
export const FURNITURE_CATALOGUE: Record<string, FurnitureSize> = {
  'bed-single': { width: 1.0, height: 0.5, depth: 2.0 },
  'bed-double': { width: 1.5, height: 0.5, depth: 2.0 },
  'bed-queen': { width: 1.6, height: 0.55, depth: 2.1 },
  'sofa-2': { width: 1.7, height: 0.8, depth: 0.9 },
  'sofa-3': { width: 2.4, height: 0.8, depth: 1.0 },
  'coffee-table': { width: 1.1, height: 0.4, depth: 0.6 },
  'tv-unit': { width: 1.6, height: 0.5, depth: 0.4 },
  'kitchen-counter': { width: 0.6, height: 0.9, depth: 2.4 },
  fridge: { width: 0.7, height: 1.8, depth: 0.7 },
  wardrobe: { width: 1.2, height: 2.2, depth: 0.6 },
  sink: { width: 0.6, height: 0.85, depth: 0.5 },
  toilet: { width: 0.4, height: 0.4, depth: 0.7 },
  shower: { width: 0.9, height: 2.1, depth: 0.9 },
  // Dressing types (ADR 0045).
  rug: { width: 2.6, height: 0.02, depth: 1.8 },
  plant: { width: 0.5, height: 1.1, depth: 0.5 },
  'floor-lamp': { width: 0.4, height: 1.6, depth: 0.4 },
  'wall-art': { width: 0.9, height: 0.7, depth: 0.05 },
  'dining-set': { width: 1.4, height: 0.75, depth: 0.9 },
  'dining-chair': { width: 0.45, height: 0.9, depth: 0.5 },
  nightstand: { width: 0.5, height: 0.55, depth: 0.4 },
  bookshelf: { width: 0.9, height: 1.8, depth: 0.35 },
}

/**
 * Resolve a type to a size. Unknown types return the default size and (in dev) warn once.
 * Never throws — a single unknown type must not break scene generation.
 */
export function sizeForType(type: string): FurnitureSize {
  const size = FURNITURE_CATALOGUE[type]
  if (size) return size

  if (import.meta.env?.DEV) {
    console.warn(`[scene-gen] unknown furniture type "${type}" — using default size`)
  }
  return DEFAULT_FURNITURE_SIZE
}
