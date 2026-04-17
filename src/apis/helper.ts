/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios'

export function encodeQueryData(data: Record<string, any>) {
    const ret: string[] = []
    for (const d in data) ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
    return ret.join('&')
}

export function handleApiError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
        return new Error(error?.response?.data?.message || 'Something went wrong with our system. Please try again!')
    }

    return new Error((error as any)?.message || 'Something went wrong with our system. Please try again!')
}
