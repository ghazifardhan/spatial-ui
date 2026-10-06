/**
 * palette — the shared set of PBR materials for generated scenes (ADR 0041).
 *
 * Interface (what a caller must know):
 *   - `materials()` returns the app-wide material set for a surface category. Call it once (scene-gen
 *     calls it per buildScene) and reuse the instances across meshes.
 *   - Materials are `MeshStandardMaterial` with tuned roughness/metalness; colours follow the
 *     modern-minimalist target (ADR 0040): warm white walls, light wood floors, cool glass.
 *
 * These are the *originals* that the highlighter (ADR 0027) saves and restores, so they must be
 * stable references for a given scene.
 */

import * as THREE from 'three'

export interface MaterialSet {
  floor: THREE.Material
  floorAccent: THREE.Material
  wall: THREE.Material
  wallAccent: THREE.Material
  baseboard: THREE.Material
  ceiling: THREE.Material
  glass: THREE.Material
  doorFrame: THREE.Material
  doorLeaf: THREE.Material
  counter: THREE.Material
  countertop: THREE.Material
  cabinet: THREE.Material
  mattress: THREE.Material
  duvet: THREE.Material
  pillow: THREE.Material
  fabric: THREE.Material
  fabricLight: THREE.Material
  wood: THREE.Material
  woodDark: THREE.Material
  metal: THREE.Material
  porcelain: THREE.Material
  ceramic: THREE.Material
  foliage: THREE.Material
  pot: THREE.Material
  rug: THREE.Material
  lampShade: THREE.Material
}

/**
 * Build a fresh material set. Kept as a function (not module-level singletons) so each scene owns
 * its materials — important because the highlighter swaps and restores them.
 */
export function materials(): MaterialSet {
  return {
    floor: new THREE.MeshStandardMaterial({ color: '#c9a877', roughness: 0.62, metalness: 0.03 }),
    floorAccent: new THREE.MeshStandardMaterial({ color: '#b98f5e', roughness: 0.55 }),
    wall: new THREE.MeshStandardMaterial({ color: '#efebe3', roughness: 0.95 }),
    wallAccent: new THREE.MeshStandardMaterial({ color: '#e2e8ec', roughness: 0.93 }),
    baseboard: new THREE.MeshStandardMaterial({ color: '#f8f6f1', roughness: 0.8 }),
    ceiling: new THREE.MeshStandardMaterial({ color: '#fcfbf8', roughness: 0.97 }),
    glass: new THREE.MeshStandardMaterial({
      color: '#cfe3ee',
      roughness: 0.03,
      metalness: 0.05,
      transparent: true,
      opacity: 0.18,
    }),
    doorFrame: new THREE.MeshStandardMaterial({ color: '#f3f0ea', roughness: 0.8 }),
    doorLeaf: new THREE.MeshStandardMaterial({ color: '#f5f3ee', roughness: 0.75 }),
    counter: new THREE.MeshStandardMaterial({ color: '#d9d3c7', roughness: 0.55 }),
    countertop: new THREE.MeshStandardMaterial({ color: '#8f8a80', roughness: 0.35 }),
    cabinet: new THREE.MeshStandardMaterial({ color: '#e7e1d6', roughness: 0.6 }),
    mattress: new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.92 }),
    duvet: new THREE.MeshStandardMaterial({ color: '#dfe4ea', roughness: 0.95 }),
    pillow: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.96 }),
    fabric: new THREE.MeshStandardMaterial({ color: '#7b8794', roughness: 0.96 }),
    fabricLight: new THREE.MeshStandardMaterial({ color: '#b9c2cb', roughness: 0.96 }),
    wood: new THREE.MeshStandardMaterial({ color: '#a37b50', roughness: 0.68 }),
    woodDark: new THREE.MeshStandardMaterial({ color: '#6f5236', roughness: 0.62 }),
    metal: new THREE.MeshStandardMaterial({ color: '#c2c6cc', roughness: 0.3, metalness: 0.75 }),
    porcelain: new THREE.MeshStandardMaterial({ color: '#f7f8f9', roughness: 0.22 }),
    ceramic: new THREE.MeshStandardMaterial({ color: '#eef1f2', roughness: 0.2 }),
    foliage: new THREE.MeshStandardMaterial({ color: '#4f7a4a', roughness: 0.85 }),
    pot: new THREE.MeshStandardMaterial({ color: '#b98a63', roughness: 0.75 }),
    rug: new THREE.MeshStandardMaterial({ color: '#cfc3b4', roughness: 1 }),
    lampShade: new THREE.MeshStandardMaterial({
      color: '#fff6e6',
      roughness: 0.7,
      emissive: '#3a2f1e',
      emissiveIntensity: 0.6,
    }),
  }
}
