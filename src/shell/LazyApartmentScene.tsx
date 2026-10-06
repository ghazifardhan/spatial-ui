/**
 * LazyApartmentScene — dynamically imports the 3D subtree so three.js is not in the initial bundle
 * (ADR 0039). The shell's detail page uses this; the heavy modules load only when a unit page
 * mounts.
 */

import { lazy, Suspense } from 'react'
import type { ApartmentSceneProps } from './ApartmentScene'

const ApartmentScene = lazy(() => import('./ApartmentScene'))

export function LazyApartmentScene(props: ApartmentSceneProps) {
  return (
    <Suspense fallback={<SceneFallback />}>
      <ApartmentScene {...props} />
    </Suspense>
  )
}

function SceneFallback() {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100%',
        opacity: 0.6,
        fontFamily: 'system-ui',
      }}
    >
      Loading 3D view…
    </div>
  )
}
