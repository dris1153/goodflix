'use client'

import { FCC } from '@/core/types/common.type'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { memo, useMemo } from 'react'

const ReactQueryProvider: FCC = ({ children }) => {
    const queryClient = useMemo(() => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    refetchOnMount: false,
                    refetchOnWindowFocus: false,
                    refetchOnReconnect: false,
                    retry: false,
                    staleTime: 1000 * 60 * 5,
                },
            },
        })
    }, [])
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default memo(ReactQueryProvider)
