import { getCountdownToUCT } from '@/utils'
import { useState, useEffect } from 'react'

interface Props {
    endTime: string
    tz?: string
    prefix?: string
    format?: 'HH:mm' | 'HH:mm:ss'
}

export const useCountdown = ({ endTime, tz = 'UTC', prefix = 'UCT', format = 'HH:mm' }: Props) => {
    const [countdown, setCountdown] = useState(getCountdownToUCT(endTime, tz, format, prefix))

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(getCountdownToUCT(endTime, tz, format, prefix))
        }, 1000)

        return () => clearInterval(interval)
    }, [endTime, tz, format, prefix])

    return countdown
}
