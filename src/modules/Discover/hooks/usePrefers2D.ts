import { useSyncExternalStore } from 'react'
import useDiscoverStore from '@/stores/useDiscoverStore'

/**
 * Subscribe to the prefers-reduced-motion media query.
 * Cleanup removes listener to prevent memory leaks.
 */
const subscribe = (cb: () => void): (() => void) => {
    if (typeof window === 'undefined') return () => {}
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', cb)
    return () => mq.removeEventListener('change', cb)
}

/**
 * Client-side snapshot — reads current media query value synchronously.
 * Synchronous read avoids flash: if user has reduced-motion on first paint,
 * we never mount the Canvas at all (red-team F10).
 */
const getSnapshot = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * SSR snapshot defaults to true → renders the safer 2D grid on first paint.
 * Client upgrades to Canvas only after hydration when motion is allowed (red-team F10).
 */
const getServerSnapshot = (): boolean => true

/**
 * Returns true when the component should render the 2D grid instead of WebGL canvas.
 * Triggers on:
 *   - OS/browser prefers-reduced-motion setting
 *   - Runtime WebGL context loss (webglFallback in store, red-team F12)
 */
export function usePrefers2D(): boolean {
    const reducedMotion = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    const webglFallback = useDiscoverStore((s) => s.webglFallback)
    return reducedMotion || webglFallback
}
