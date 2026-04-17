'use client'
import { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useTextureAtlas } from './useTextureAtlas'
import PosterInstances from './PosterInstances'
import CylinderControls from './CylinderControls'
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
function SceneContents({
    movies,
    moodPalette,
    onSelect,
    disabled,
}: CylinderSceneProps) {
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
            <CylinderControls
                rotatorRef={rotatorRef}
                count={movies.length}
            />
        </>
    )
}

// CylinderScene: public-facing component.
// Wraps Canvas, sets camera outside-looking-in at radius * 1.8 (red-team F15).
export default function CylinderScene({
    movies,
    moodPalette,
    onSelect,
    disabled = false,
}: CylinderSceneProps) {
    const radius = computeRadius(movies.length)
    // Camera positioned outside cylinder, looking toward origin (red-team F15)
    const cameraZ = radius * 1.8

    return (
        <Canvas
            camera={{ fov: 45, position: [0, 0, cameraZ], near: 0.1, far: 100 }}
            // DPR capped at 1.5 to manage fragment cost on mid-tier GPUs (red-team F15)
            dpr={[1, 1.5]}
            style={{ position: 'absolute', inset: 0 }}
            // Transparent background so page background shows through
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
            gl={{ antialias: true, alpha: true }}
        >
            <SceneContents
                movies={movies}
                moodPalette={moodPalette}
                onSelect={onSelect}
                disabled={disabled}
            />
        </Canvas>
    )
}
