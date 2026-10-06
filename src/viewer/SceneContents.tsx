/**
 * SceneContents — mounts a built `THREE.Group` and wires the camera rig + orbit controls
 * (ADR 0022, 0023, 0024). Lives inside the R3F `<Canvas>`.
 *
 * Camera framing is applied imperatively: on mount and whenever the `scene` identity changes, and
 * also in response to requests from the Viewer's imperative handle. Nothing goes through React
 * state, so orbiting never re-renders the app (ADR 0012).
 */

import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { computeBounds, frameDistance } from './framing'
import { useCameraRequests } from './viewer-control-requests'

interface SceneContentsProps {
  scene: THREE.Object3D
  /** Vertical FOV in degrees; must match the camera configured on the Canvas. */
  fov: number
  /**
   * What to mount for the scene. The Viewer passes the picker (or a plain `<primitive>`); this
   * module only owns camera framing + orbit controls, so interaction concerns stay in a sibling.
   */
  children: ReactNode
}

/** Direction the camera views the scene from (three-quarter bird's-eye). */
const VIEW_DIRECTION = new THREE.Vector3(1, 0.8, 1).normalize()

/** Clamp bounds shared by imperative zoom, so the camera stays usable. */
const MIN_DISTANCE = 1.5
const MAX_DISTANCE = 60

/** Keep the orbit polar angle just off the poles to avoid gimbal flips (matches OrbitControls). */
const MIN_POLAR = 0.1
const MAX_POLAR = Math.PI / 2 - 0.02

export function SceneContents({ scene, fov, children }: SceneContentsProps) {
  const camera = useThree((state) => state.camera)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const requests = useCameraRequests()

  // Place the camera on VIEW_DIRECTION at the framing distance, looking at the scene centre.
  const frameScene = useCallback(() => {
    const { center, radius } = computeBounds(scene)
    const distance = frameDistance(radius, fov)
    camera.position.copy(center).addScaledVector(VIEW_DIRECTION, distance)
    camera.lookAt(center)
    camera.updateProjectionMatrix()

    const controls = controlsRef.current
    if (controls) {
      controls.target.copy(center)
      controls.update()
    }
  }, [camera, scene, fov])

  // Re-frame whenever a new scene is mounted.
  useEffect(() => {
    frameScene()
  }, [frameScene])

  // Apply imperative requests from the Viewer handle without a React re-render.
  // The ref mutation below is intentional: ADR 0012 requires camera/navigation changes to stay out
  // of React state, so requests are consumed from a mutable ref rather than re-rendering per frame.
  useFrame(() => {
    const request = requests.current
    if (!request) return
    requests.current = null // oxlint-disable-line react/immutability

    if (request.type === 'reset') {
      frameScene()
      return
    }

    const controls = controlsRef.current

    // All non-reset navigation pivots around the current orbit target (or the scene centre).
    const target = controls ? controls.target : computeBounds(scene).center

    if (request.type === 'focus') {
      // Aim the orbit target at a point, preserving the current orbit distance.
      const distance = controls
        ? camera.position.distanceTo(target)
        : frameDistance(computeBounds(scene).radius, fov)
      const direction = controls
        ? camera.position.clone().sub(target).normalize()
        : VIEW_DIRECTION.clone()

      camera.position.copy(request.point).addScaledVector(direction, distance)
      camera.lookAt(request.point)
      camera.updateProjectionMatrix()
      if (controls) {
        controls.target.copy(request.point)
        controls.update()
      }
      return
    }

    if (request.type === 'zoom') {
      // Dolly toward/away from the target along the current view direction. Clamp to a sensible
      // range so the camera never passes through the target or drifts to infinity.
      const offset = camera.position.clone().sub(target)
      const distance = THREE.MathUtils.clamp(
        offset.length() * request.factor,
        MIN_DISTANCE,
        MAX_DISTANCE,
      )
      camera.position.copy(target).addScaledVector(offset.normalize(), distance)
      camera.updateProjectionMatrix()
      if (controls) controls.update()
      return
    }

    if (request.type === 'pan') {
      // Slide in the plane perpendicular to the view direction: `right` and `up` are already in
      // world units (a fraction of the current orbit distance, scaled by the caller).
      const forward = target.clone().sub(camera.position).normalize()
      const rightAxis = new THREE.Vector3().crossVectors(forward, camera.up).normalize()
      const upAxis = new THREE.Vector3().crossVectors(rightAxis, forward).normalize()
      const delta = new THREE.Vector3()
        .addScaledVector(rightAxis, request.right)
        .addScaledVector(upAxis, request.up)
      camera.position.add(delta)
      if (controls) {
        controls.target.add(delta)
        controls.update()
      } else {
        camera.lookAt(target.clone().add(delta))
      }
      camera.updateProjectionMatrix()
      return
    }

    // orbit: rotate the camera around the target by the requested azimuth/polar deltas.
    const offset = camera.position.clone().sub(target)
    const spherical = new THREE.Spherical().setFromVector3(offset)
    spherical.theta += request.azimuth
    spherical.phi = THREE.MathUtils.clamp(
      spherical.phi + request.polar,
      MIN_POLAR,
      MAX_POLAR,
    )
    camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical))
    camera.lookAt(target)
    camera.updateProjectionMatrix()
    if (controls) controls.update()
  })

  return (
    <>
      {children}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={MIN_POLAR}
        maxPolarAngle={MAX_POLAR}
        makeDefault
      />
    </>
  )
}
