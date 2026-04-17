import { FCC } from '@/core/types/common.type'
import React from 'react'

export const Show: FCC<{ when?: boolean }> = (props) => {
    return <>{props.when ? <>{props.children}</> : null}</>
}
