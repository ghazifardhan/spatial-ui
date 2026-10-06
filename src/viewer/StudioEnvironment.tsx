/**
 * StudioEnvironment — a fully local image-based lighting environment (ADR 0046).
 *
 * Rather than fetch an HDRI from a CDN (network dependency, offline-unsafe), we build three's
 * built-in `RoomEnvironment` into a PMREM texture and assign it as `scene.environment`. This gives
 * PBR materials believable ambient reflection with zero external assets.
 */

import { useEffect } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { useThree } from '@react-three/fiber'

export function StudioEnvironment({ intensity = 0.6 }: { intensity?: number }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const roomEnv = new RoomEnvironment()
    const envTexture = pmrem.fromScene(roomEnv, 0.04).texture

    scene.environment = envTexture // oxlint-disable-line react/immutability
    scene.environmentIntensity = intensity

    return () => {
      scene.environment = null // oxlint-disable-line react/immutability
      envTexture.dispose()
      roomEnv.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, intensity])

  return null
}
