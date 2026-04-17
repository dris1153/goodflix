import type * as THREE from 'three'

// Atlas result returned by useTextureAtlas hook.
// uvOffsets[i] = [x, y, w, h] in normalised UV space (0..1).
export interface Atlas {
    texture: THREE.CanvasTexture
    uvOffsets: [number, number, number, number][]
}

// Props shared by PosterInstances
export interface PosterInstancesProps {
    movies: import('@/core/types/movie.type').Movie[]
    atlas: Atlas
    moodPalette: import('@/core/types/movie.type').MoodPalette
    onSelect?: (movieId: number) => void
    disabled?: boolean
}

// Props for CylinderScene (public API)
export interface CylinderSceneProps {
    movies: import('@/core/types/movie.type').Movie[]
    moodPalette: import('@/core/types/movie.type').MoodPalette
    onSelect?: (movieId: number) => void
    disabled?: boolean
}
