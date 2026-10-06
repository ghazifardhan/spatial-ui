/**
 * Viewer — the public component of Module #4.
 *
 * Interface (what a caller must know):
 *   - `<Viewer scene={group} ref={ref} />` mounts a pre-built THREE.Group (ADR 0023) and lets the
 *     user orbit it (ADR 0022). A default lighting rig, neutral background, and camera auto-framing
 *     are included (ADR 0024).
 *   - The `ref` exposes a small imperative interface (ADR 0021): `resetView()` re-frames the scene;
 *     `focusOn(point)` aims the camera at a world-space point.
 *   - Props: `scene` (required), `fov`, `background`, `showGrid`.
 *
 * The viewer does NOT import domain/repository — it depends only on scene-gen's output type.
 */

import { forwardRef, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Grid } from '@react-three/drei'
import { SceneContents } from './SceneContents'
import { StudioEnvironment } from './StudioEnvironment'
import { CameraRequestContext, type CameraRequest, type CameraRequestRef } from './viewer-control-requests'

export interface ViewerHandle {
  /** Re-frame the camera to fit the whole scene. */
  resetView(): void
  /** Aim the camera at a world-space point, preserving the current orbit distance. */
  focusOn(point: THREE.Vector3): void
  /**
   * Dolly the camera along its current view direction. Pass a positive `steps` to zoom in and a
   * negative `steps` to zoom out; the magnitude is how many zoom increments to apply.
   */
  zoomBy(steps: number): void
  /**
   * Slide the orbit target in the view plane. `dx` moves right/left, `dy` moves up/down; each unit
   * is a fraction of the current orbit distance, so the same input feels consistent at any zoom.
   */
  panBy(dx: number, dy: number): void
  /** Orbit around the target. `dx`/`dy` are fractions of a quarter-turn, so ±1 is a quarter-turn. */
  orbitBy(dx: number, dy: number): void
}

/** One zoom increment multiplies the orbit distance by this factor (slightly less than 1 → in). */
const ZOOM_STEP = 0.82
/** One unit of `orbitBy` rotates this many radians (0.35 ≈ 20°). */
const ORBIT_STEP = 0.35

export interface ViewerProps {
  /** A scene built by scene-gen (used for framing and as the default mounted content). */
  scene: THREE.Group
  /** Vertical FOV, degrees. Default 50. */
  fov?: number
  /** Canvas background colour. Default a neutral dark grey. */
  background?: string
  /** Show a subtle ground grid. Default false. */
  showGrid?: boolean
  /**
   * Optional scene contents to mount instead of a bare `<primitive object={scene} />`. Compose an
   * interaction module here (e.g. `<ScenePicker .../>`) so the viewer stays interaction-agnostic.
   */
  children?: ReactNode
  /** Optional controls rendered as an overlay on top of the canvas (e.g. the ceiling toggle). */
  overlay?: ReactNode
}

export const Viewer = forwardRef(function Viewer(
  { scene, fov = 50, background = '#eef1f4', showGrid = false, children, overlay }: ViewerProps,
  ref: Ref<ViewerHandle>,
) {
  // A mutable bridge to the in-canvas scene; requests are applied inside `useFrame` (ADR 0012).
  const requests = useRef<CameraRequest | null>(null) as CameraRequestRef

  useImperativeHandle(
    ref,
    (): ViewerHandle => ({
      resetView() {
        requests.current = { type: 'reset' }
      },
      focusOn(point: THREE.Vector3) {
        requests.current = { type: 'focus', point: point.clone() }
      },
      zoomBy(steps: number) {
        requests.current = { type: 'zoom', factor: Math.pow(ZOOM_STEP, -steps) }
      },
      panBy(dx: number, dy: number) {
        requests.current = { type: 'pan', right: dx, up: dy }
      },
      orbitBy(dx: number, dy: number) {
        requests.current = { type: 'orbit', azimuth: dx * ORBIT_STEP, polar: dy * ORBIT_STEP }
      },
    }),
    [],
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {overlay}
        </div>
      )}
      <CameraRequestContext.Provider value={requests}>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
          camera={{ fov, position: [8, 6, 8], near: 0.05, far: 200 }}
          style={{ width: '100%', height: '100%' }}
        >
        <color attach="background" args={[background]} />

        {/* Local image-based ambient light (ADR 0046) — no external HDRI fetch. */}
        <StudioEnvironment intensity={0.7} />

        {/* Soft daylight rig (ADR 0043): low ambient, a warm key with tuned shadows, a cool fill. */}
        <ambientLight intensity={0.25} />
        <hemisphereLight intensity={0.5} color="#fdf6ec" groundColor="#3a3830" />
        <directionalLight
          castShadow
          intensity={2.0}
          color="#fff4e0"
          position={[9, 13, 6]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
        >
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20, 0.1, 60]} />
        </directionalLight>
        <directionalLight intensity={0.35} color="#cfe0ff" position={[-6, 8, -5]} />

        {/* Soft contact shadows ground the furniture (ADR 0046). */}
        <ContactShadows
          position={[0, 0.01, 0]}
          scale={40}
          far={4}
          blur={2.4}
          opacity={0.35}
          resolution={1024}
          color="#3a3327"
        />

        <SceneContents scene={scene} fov={fov}>
          {children ?? <primitive object={scene} />}
        </SceneContents>

        {showGrid && (
          <Grid
            args={[40, 40]}
            cellSize={0.5}
            cellColor="#33333a"
            sectionSize={2.5}
            sectionColor="#4a4a55"
            infiniteGrid
            fadeDistance={30}
            position={[0, 0.001, 0]}
          />
        )}
        </Canvas>
      </CameraRequestContext.Provider>
    </div>
  )
}) as (props: ViewerProps & { ref?: Ref<ViewerHandle> }) => React.ReactElement
