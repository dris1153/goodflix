'use client'

import { Toaster } from '@/components/base/toaster'
import { FCC } from '@/core/types/common.type'
import { memo } from 'react'

const LayoutProvider: FCC = ({ children }) => {
    return (
        <>
            <div className="flex h-screen w-full">
                <main className="max-w-full flex-1">{children}</main>
                <Toaster />
            </div>
        </>
    )
}

export default memo(LayoutProvider)
