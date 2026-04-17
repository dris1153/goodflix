'use client'
import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

interface Props {
    // Ref to the Group that wraps all poster instances
    rotatorRef: React.RefObject<THREE.Group | null>
    // Total number of posters — used to compute snap interval
    count: number
}

const SENSITIVITY = 0.005
const DAMPING = 0.92
const VELOCITY_THRESHOLD = 0.0005
const SNAP_LERP = 0.1
const TWO_PI = Math.PI * 2

// CylinderControls: attaches raw pointer listeners to the GL canvas.
// Rotating via rotatorRef.current avoids interfering with poster raycasting.
export default function CylinderControls({ rotatorRef, count }: Props) {
    const { gl } = useThree()

    const stateRef = useRef({
        isDragging: false,
        startX: 0,
        lastX: 0,
        velocity: 0,
        // Snapshot of group.rotation.y when drag starts
        rotationAtStart: 0,
    })

    useEffect(() => {
        const dom = gl.domElement
        const s = stateRef.current

        const onPointerDown = (e: PointerEvent) => {
            s.isDragging = true
            s.startX = e.clientX
            s.lastX = e.clientX
            s.velocity = 0
            s.rotationAtStart = rotatorRef.current?.rotation.y ?? 0
            dom.setPointerCapture(e.pointerId)
        }

        const onPointerMove = (e: PointerEvent) => {
            if (!s.isDragging) return
            const delta = e.clientX - s.lastX
            s.velocity = delta * SENSITIVITY
            if (rotatorRef.current) {
                rotatorRef.current.rotation.y += delta * SENSITIVITY
            }
            s.lastX = e.clientX
        }

        const onPointerUp = (e: PointerEvent) => {
            if (!s.isDragging) return
            s.isDragging = false
            dom.releasePointerCapture(e.pointerId)
            // velocity already set from last move; momentum handled in useFrame
        }

        dom.addEventListener('pointerdown', onPointerDown)
        dom.addEventListener('pointermove', onPointerMove)
        dom.addEventListener('pointerup', onPointerUp)
        dom.addEventListener('pointercancel', onPointerUp)

        return () => {
            dom.removeEventListener('pointerdown', onPointerDown)
            dom.removeEventListener('pointermove', onPointerMove)
            dom.removeEventListener('pointerup', onPointerUp)
            dom.removeEventListener('pointercancel', onPointerUp)
        }
    }, [gl, rotatorRef])

    useFrame(() => {
        const s = stateRef.current
        const group = rotatorRef.current
        if (!group) return

        if (s.isDragging) return

        // Apply momentum with exponential damping
        if (Math.abs(s.velocity) > VELOCITY_THRESHOLD) {
            group.rotation.y += s.velocity
            s.velocity *= DAMPING
        } else if (count > 0) {
            // Velocity settled — snap to nearest poster
            s.velocity = 0
            const snapInterval = TWO_PI / count
            const target = Math.round(group.rotation.y / snapInterval) * snapInterval
            group.rotation.y += (target - group.rotation.y) * SNAP_LERP
        }
    })

    // No JSX — purely imperative side effects
    return null
}
