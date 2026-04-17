'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ShaderMaterial } from 'three'
import { VERT_SRC, FRAG_SRC } from './shaders/poster-shaders'
import type { PosterInstancesProps } from './types'

const POSTER_W = 2.0
const POSTER_H = 3.0
const GAP = 0.3
const TWO_PI = Math.PI * 2

export default function PosterInstances({
    movies,
    atlas,
    moodPalette,
    onSelect,
    disabled = false,
}: PosterInstancesProps) {
    const count = movies.length
    const materialRef = useRef<ShaderMaterial>(null!)

    // Radius derived from circumference so posters tile evenly
    const radius = count > 0
        ? (count * (POSTER_W + GAP)) / TWO_PI
        : (POSTER_W + GAP) / TWO_PI

    // Build per-instance matrices and UV attribute data
    const { matrices, uvFlat } = useMemo(() => {
        const dummy = new THREE.Object3D()
        const mat4List: THREE.Matrix4[] = []
        const flat = new Float32Array(count * 4)

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * TWO_PI
            // Position on cylinder circumference, face inward toward origin
            dummy.position.set(
                Math.sin(angle) * radius,
                0,
                Math.cos(angle) * radius,
            )
            // Rotate poster to face inward (toward the axis)
            dummy.rotation.y = angle
            dummy.updateMatrix()
            mat4List.push(dummy.matrix.clone())

            // UV offset for this poster [x, y, w, h]
            const [x, y, w, h] = atlas.uvOffsets[i] ?? [0, 0, 0, 0]
            flat[i * 4 + 0] = x
            flat[i * 4 + 1] = y
            flat[i * 4 + 2] = w
            flat[i * 4 + 3] = h
        }

        return { matrices: mat4List, uvFlat: flat }
    }, [count, radius, atlas.uvOffsets])

    // Ref to the instanced mesh so we can set matrices after mount
    const meshRef = useRef<THREE.InstancedMesh>(null!)

    // Apply matrices once mesh is mounted
    const applyMatrices = (mesh: THREE.InstancedMesh | null) => {
        if (!mesh) return
        meshRef.current = mesh
        matrices.forEach((m, i) => mesh.setMatrixAt(i, m))
        mesh.instanceMatrix.needsUpdate = true

        // Set aUvOffset per-instance attribute
        const geom = mesh.geometry as THREE.BufferGeometry
        geom.setAttribute(
            'aUvOffset',
            new THREE.InstancedBufferAttribute(uvFlat, 4),
        )
    }

    // Update mood uniforms each frame (only when changed)
    const tintVec = useMemo(() => new THREE.Vector3(...moodPalette.tint), [moodPalette.tint])
    const glowVec = useMemo(() => new THREE.Vector3(...moodPalette.glow), [moodPalette.glow])

    useFrame(({ clock }) => {
        const mat = materialRef.current
        if (!mat) return
        mat.uniforms.uTime.value = clock.getElapsedTime()
        mat.uniforms.uMoodTint.value = tintVec
        mat.uniforms.uMoodGlow.value = glowVec
    })

    // Click/drag discrimination (red-team F7)
    // pointerDown stores movie id + cursor position per instance
    const pointerDownRef = useRef<{ instanceId: number; movieId: number; x: number; y: number; t: number } | null>(null)

    const handlePointerDown = (e: THREE.Event & { instanceId?: number; nativeEvent?: PointerEvent }) => {
        if (disabled) return
        const id = (e as { instanceId?: number }).instanceId
        if (id == null || id < 0 || id >= count) return
        const movie = movies[id]
        if (!movie) return
        const ne = (e as { nativeEvent?: PointerEvent }).nativeEvent
        pointerDownRef.current = {
            instanceId: id,
            movieId: movie.id,
            x: ne?.clientX ?? 0,
            y: ne?.clientY ?? 0,
            t: Date.now(),
        }
    }

    const handlePointerUp = (e: THREE.Event & { instanceId?: number; nativeEvent?: PointerEvent }) => {
        if (disabled || !pointerDownRef.current) return
        const id = (e as { instanceId?: number }).instanceId
        if (id == null || id !== pointerDownRef.current.instanceId) { pointerDownRef.current = null; return }

        const ne = (e as { nativeEvent?: PointerEvent }).nativeEvent
        const dx = (ne?.clientX ?? 0) - pointerDownRef.current.x
        const dy = (ne?.clientY ?? 0) - pointerDownRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const dt = Date.now() - pointerDownRef.current.t

        // Treat as drag if movement > 5px or held > 250ms
        if (dist > 5 || dt > 250) { pointerDownRef.current = null; return }

        const movie = movies[id]
        if (movie && movie.id === pointerDownRef.current.movieId) {
            onSelect?.(movie.id)
        }
        pointerDownRef.current = null
    }

    if (count === 0) return null

    const uniforms = {
        uAtlas: { value: atlas.texture },
        uMoodTint: { value: tintVec },
        uMoodGlow: { value: glowVec },
        uTime: { value: 0 },
    }

    return (
        <instancedMesh
            ref={applyMatrices}
            args={[undefined, undefined, count]}
            onPointerDown={handlePointerDown as unknown as (e: React.PointerEvent) => void}
            onPointerUp={handlePointerUp as unknown as (e: React.PointerEvent) => void}
            // Disable raycasting entirely when disabled (e.g. during search)
            raycast={disabled ? () => null : undefined}
        >
            <planeGeometry args={[POSTER_W, POSTER_H]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={VERT_SRC}
                fragmentShader={FRAG_SRC}
                transparent={true}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    )
}
