'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Atlas } from './types'

// Atlas grid dimensions
const COLS = 8
const CELL_W = 228
const CELL_H = 342
const LOAD_TIMEOUT_MS = 10_000

// Load a single image with crossOrigin + timeout + abort signal.
// Resolves with HTMLImageElement on success, null on failure/abort.
async function loadImage(url: string, signal: AbortSignal): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        if (signal.aborted) {
            resolve(null)
            return
        }

        const img = new Image()
        img.crossOrigin = 'anonymous'

        const timer = setTimeout(() => {
            img.src = ''
            resolve(null)
        }, LOAD_TIMEOUT_MS)
        const onAbort = () => {
            clearTimeout(timer)
            img.src = ''
            resolve(null)
        }
        signal.addEventListener('abort', onAbort, { once: true })

        img.onload = () => {
            clearTimeout(timer)
            signal.removeEventListener('abort', onAbort)
            resolve(img)
        }
        img.onerror = () => {
            clearTimeout(timer)
            signal.removeEventListener('abort', onAbort)
            resolve(null)
        }

        img.src = url
    })
}

// Pack loaded images into an offscreen canvas atlas.
// Returns CanvasTexture + per-image UV offsets (x,y,w,h in 0..1).
function buildAtlas(
    images: (HTMLImageElement | null)[],
    count: number,
): { texture: THREE.CanvasTexture; uvOffsets: [number, number, number, number][] } {
    const rows = Math.ceil(count / COLS)
    const canvasW = COLS * CELL_W
    const canvasH = rows * CELL_H

    const canvas = document.createElement('canvas')
    canvas.width = canvasW
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvasW, canvasH)

    const uvOffsets: [number, number, number, number][] = []

    for (let i = 0; i < count; i++) {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        const px = col * CELL_W
        const py = row * CELL_H

        const img = images[i]
        if (img) {
            ctx.drawImage(img, px, py, CELL_W, CELL_H)
        } else {
            // Fallback: dark grey placeholder
            ctx.fillStyle = '#1a1a1a'
            ctx.fillRect(px, py, CELL_W, CELL_H)
        }

        uvOffsets.push([px / canvasW, py / canvasH, CELL_W / canvasW, CELL_H / canvasH])
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true

    return { texture, uvOffsets }
}

// Stable hash key to memoize by URL list content
function urlsKey(urls: string[]): string {
    return JSON.stringify(urls)
}

interface AtlasState extends Atlas {
    ready: true
}

// Hook: accept posterUrls[], return { texture, uvOffsets, ready }.
// Double-buffer: previous atlas stays mounted until new one is fully built.
// Disposes old texture on swap to prevent GPU memory leak (red-team F4).
export function useTextureAtlas(
    posterUrls: string[],
): (AtlasState & { ready: true }) | { ready: false; texture: null; uvOffsets: null } {
    const [atlas, setAtlas] = useState<AtlasState | null>(null)
    // Hold previous atlas ref for double-buffer (keep rendering until new ready)
    const prevTextureRef = useRef<THREE.CanvasTexture | null>(null)
    const keyRef = useRef('')

    useEffect(() => {
        const key = urlsKey(posterUrls)
        // Skip if same URL set (keyRef tracks last processed key reliably across renders)
        if (key === keyRef.current) return
        keyRef.current = key

        if (posterUrls.length === 0) {
            setAtlas(null)
            return
        }

        const controller = new AbortController()
        const { signal } = controller

        ;(async () => {
            // Load all images in parallel; failed loads return null (skip, not crash)
            const images = await Promise.all(posterUrls.map((url) => loadImage(url, signal)))

            if (signal.aborted) return

            const { texture, uvOffsets } = buildAtlas(images, posterUrls.length)

            // Dev memory logging (F4 requirement)
            if (process.env.NODE_ENV === 'development') {
                console.debug('[useTextureAtlas] atlas built', {
                    count: posterUrls.length,
                    canvasSize: `${COLS * CELL_W}×${Math.ceil(posterUrls.length / COLS) * CELL_H}`,
                })
            }

            // Double-buffer swap: dispose previous texture after new one is created
            setAtlas((prev) => {
                if (prev) {
                    prevTextureRef.current = prev.texture
                }
                return { texture, uvOffsets, ready: true }
            })
        })()

        return () => {
            controller.abort()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlsKey(posterUrls)])

    // Dispose previous texture after render cycle completes swap
    useEffect(() => {
        const old = prevTextureRef.current
        if (old) {
            old.dispose()
            prevTextureRef.current = null
            if (process.env.NODE_ENV === 'development') {
                console.debug('[useTextureAtlas] disposed old atlas texture')
            }
        }
    }, [atlas])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setAtlas((prev) => {
                if (prev) prev.texture.dispose()
                return null
            })
        }
    }, [])

    if (!atlas) return { ready: false, texture: null, uvOffsets: null }
    return atlas
}
