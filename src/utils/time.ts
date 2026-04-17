import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(duration)

export const formatElapsedTime = (datetime: string): string => {
    const now = new Date()
    const date = new Date(datetime)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const days = Math.floor(diffInSeconds / (3600 * 24))
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((diffInSeconds % 3600) / 60)
    const seconds = diffInSeconds % 60

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

    return parts.join(' ')
}

export const formatRelativeTime = (datetime: string): string => {
    const time = dayjs(datetime)
    const now = dayjs()

    if (time.isAfter(now)) {
        console.warn(`Future timestamp detected: ${datetime}`)
        return 'just now'
    }

    return time.fromNow()
}

export const getCountdownToUCT = (
    endTime: string,
    tz: string = 'UTC',
    format: 'HH:mm' | 'HH:mm:ss' = 'HH:mm',
    prefix = 'UCT',
): string => {
    const now = dayjs.utc()
    const end = dayjs.utc(endTime).tz(tz)

    const diff = end.diff(now)

    const prefixText = !!prefix ? ` ${prefix}` : ''

    if (diff <= 0) {
        return `00:00${prefixText}`
    }

    const duration = dayjs.duration(diff)
    const hours = Math.floor(duration.asHours()).toString().padStart(2, '0')
    const minutes = duration.minutes().toString().padStart(2, '0')
    const seconds = duration.seconds().toString().padStart(2, '0')

    if (format === 'HH:mm:ss') {
        return `${hours}:${minutes}:${seconds}${prefixText}`
    }

    return `${hours}:${minutes}${prefixText}`
}

export const convertToUCTTime = (timestamp: string, tz: string, format: string = 'HH:mm'): string => {
    return `${dayjs.utc(timestamp).tz(tz).format(format)} UCT`
}
