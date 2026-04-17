'use client'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import useDiscoverStore from '@/stores/useDiscoverStore'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

/**
 * CanvasErrorBoundary — catches React render errors from CylinderScene / R3F Canvas.
 * On catch: triggers 2D grid fallback via store (red-team F12 — complement to runtime
 * WebGL context-loss handler which handles GPU-level failures; this handles JS errors).
 * Renders null so the parent's conditional (prefers2D → ReducedMotionGrid) takes over.
 */
export default class CanvasErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): State {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // Signal store so usePrefers2D returns true → ReducedMotionGrid mounts
        useDiscoverStore.getState().setWebglFallback(true)
        // Log for debugging without crashing — keep error surfaced in dev
        if (process.env.NODE_ENV !== 'production') {
            console.error('[CanvasErrorBoundary] Canvas render error:', error, info.componentStack)
        }
    }

    render(): ReactNode {
        // Render null — parent DiscoverPage will show ReducedMotionGrid via prefers2D flag
        if (this.state.hasError) return null
        return this.props.children
    }
}
