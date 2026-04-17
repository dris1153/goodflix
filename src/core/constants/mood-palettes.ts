import { MoodChip } from '@/core/types/movie.type'

export const DEFAULT_PALETTE = {
    tint: [1, 1, 1] as [number, number, number],
    glow: [0.3, 0.3, 0.3] as [number, number, number],
    speed: 1.0,
}

export const MOOD_CHIPS: MoodChip[] = [
    {
        id: 'neon-noir',
        label: 'Neon Noir',
        seedQuery: 'neon noir cyberpunk moody city movies',
        palette: { tint: [1.0, 0.5, 0.95], glow: [0.2, 0.9, 1.0], speed: 0.9 },
    },
    {
        id: 'dystopian-future',
        label: 'Dystopian Future',
        seedQuery: 'dystopian bleak science fiction future society movies',
        palette: { tint: [0.95, 0.75, 0.5], glow: [0.15, 0.6, 0.75], speed: 0.8 },
    },
    {
        id: 'just-had-a-breakup',
        label: 'Just Had a Breakup',
        seedQuery: 'melancholy cathartic movies for processing heartbreak',
        palette: { tint: [0.75, 0.7, 1.0], glow: [0.5, 0.3, 0.8], speed: 0.7 },
    },
    {
        id: 'cozy-sunday',
        label: 'Cozy Sunday',
        seedQuery: 'cozy warm feel-good comfort movies',
        palette: { tint: [1.0, 0.85, 0.7], glow: [0.9, 0.6, 0.4], speed: 0.85 },
    },
    {
        id: 'mind-bending',
        label: 'Mind-Bending',
        seedQuery: 'mind-bending reality-questioning cerebral puzzle films',
        palette: { tint: [0.7, 0.9, 1.0], glow: [0.3, 0.5, 1.0], speed: 1.1 },
    },
    {
        id: 'adrenaline-rush',
        label: 'Adrenaline Rush',
        seedQuery: 'high-octane action thriller relentless pacing movies',
        palette: { tint: [1.0, 0.6, 0.5], glow: [1.0, 0.3, 0.2], speed: 1.3 },
    },
    {
        id: 'slow-burn-romance',
        label: 'Slow Burn Romance',
        seedQuery: 'slow burn aching beautiful romance films',
        palette: { tint: [1.0, 0.8, 0.85], glow: [0.95, 0.5, 0.6], speed: 0.75 },
    },
    {
        id: 'golden-age-classic',
        label: 'Golden Age',
        seedQuery: 'classic hollywood golden age 1940s 1950s movies',
        palette: { tint: [1.0, 0.9, 0.7], glow: [0.9, 0.75, 0.4], speed: 0.8 },
    },
]

export function findMood(id: string | null | undefined): MoodChip | undefined {
    return id ? MOOD_CHIPS.find((m) => m.id === id) : undefined
}
