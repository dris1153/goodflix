/**
 * Next.js middleware.
 * F10: Origin gate for /api/search and /api/search/trivia.
 * Rejects requests where Origin/Referer does not match NEXT_PUBLIC_APP_URL.
 * Protects against CSRF-style abuse from external callers.
 */
import { NextRequest, NextResponse } from 'next/server'
import { envConfig } from '@/core/configs/env.config'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Origin gate: apply to /api/search and sub-paths (e.g. /api/search/trivia)
    if (pathname.startsWith('/api/search')) {
        const origin = request.headers.get('origin') ?? request.headers.get('referer') ?? ''
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

        const allowed =
            !origin || origin.startsWith(appUrl) || (!envConfig.isProduction && origin.startsWith('http://localhost'))

        if (!allowed) {
            return new NextResponse('forbidden', { status: 403 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
        '/api/search/:path*',
    ],
}
