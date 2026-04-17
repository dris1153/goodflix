'use client'
import { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { toast } from 'sonner'
import { useTextureAtlas } from './useTextureAtlas'
import PosterInstances from './PosterInstances'
import CylinderControls from './CylinderControls'
import useDiscoverStore from '@/stores/useDiscoverStore'
import type { CylinderSceneProps } from './types'

const POSTER_W = 2.0
const GAP = 0.3
const TWO_PI = Math.PI * 2
const DEFAULT_RADIUS = (8 * (POSTER_W + GAP)) / TWO_PI

function computeRadius(count: number): number {
    if (count <= 0) return DEFAULT_RADIUS
    return (count * (POSTER_W + GAP)) / TWO_PI
}

// Inner component that consumes the atlas hook (must live inside Canvas).
function SceneContents({ movies, moodPalette, onSelect, disabled }: CylinderSceneProps) {
    const rotatorRef = useRef<THREE.Group>(null)
    const posterUrls = movies.map((m) => m.posterUrl)
    const atlasResult = useTextureAtlas(posterUrls)

    return (
        <>
            <group ref={rotatorRef}>
                {atlasResult.ready && (
                    <Suspense fallback={null}>
                        <PosterInstances
                            movies={movies}
                            atlas={atlasResult}
                            moodPalette={moodPalette}
                            onSelect={onSelect}
                            disabled={disabled}
                        />
                    </Suspense>
                )}
            </group>
            <CylinderControls rotatorRef={rotatorRef} count={movies.length} />
        </>
    )
}

// CylinderScene: public-facing component.
// Wraps Canvas, sets camera outside-looking-in at radius * 1.8 (red-team F15).
export default function CylinderScene({ movies, moodPalette, onSelect, disabled = false }: CylinderSceneProps) {
    const radius = computeRadius(movies.length)
    // Camera positioned outside cylinder, looking toward origin (red-team F15)
    const cameraZ = radius * 1.8

    return (
        <Canvas
            camera={{ fov: 45, position: [0, 0, cameraZ], near: 0.1, far: 100 }}
            // DPR capped at 1.5 to manage fragment cost on mid-tier GPUs (red-team F15)
            dpr={[1, 1.5]}
            style={{ position: 'absolute', inset: 0 }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0)

                // WebGL context-loss / restore handlers (red-team F12)
                const canvas = gl.domElement
                const onLost = (e: Event) => {
                    // REQUIRED: preventDefault() allows the browser to restore the context
                    e.preventDefault()
                    useDiscoverStore.getState().setWebglFallback(true)
                    toast('3D view unavailable — showing grid.', { id: 'webgl-fallback' })
                }
                const onRestored = () => {
                    useDiscoverStore.getState().setWebglFallback(false)
                    toast.dismiss('webgl-fallback')
                }
                canvas.addEventListener('webglcontextlost', onLost)
                canvas.addEventListener('webglcontextrestored', onRestored)
                // Cleanup on unmount
                return () => {
                    canvas.removeEventListener('webglcontextlost', onLost)
                    canvas.removeEventListener('webglcontextrestored', onRestored)
                }
            }}
        >
            <SceneContents movies={movies} moodPalette={moodPalette} onSelect={onSelect} disabled={disabled} />
        </Canvas>
    )
}
