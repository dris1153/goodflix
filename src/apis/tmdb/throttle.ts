/**
 * Bottleneck rate-limiter for TMDB API calls.
 * Reservoir: 40 requests/second, minTime: 25ms between calls.
 * All TMDB requests should go through throttle.schedule().
 */
import Bottleneck from 'bottleneck'

const limiter = new Bottleneck({
    reservoir: 40,
    reservoirRefreshAmount: 40,
    reservoirRefreshInterval: 1000,
    minTime: 25,
})

/**
 * Schedule a function through the TMDB rate limiter.
 * Returns the same promise as the function, but rate-limited.
 */
export function schedule<T>(fn: () => Promise<T>): Promise<T> {
    return limiter.schedule(fn)
}
