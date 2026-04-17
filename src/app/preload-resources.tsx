'use client'

import { envConfig } from '@/core/configs/env.config'
import ReactDOM from 'react-dom'

export function PreloadResources() {
    ReactDOM.preconnect(envConfig.API_URL, { crossOrigin: 'anonymous' })
    return <></>
}
