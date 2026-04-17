/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from '@/utils'
import { ComponentPropsWithoutRef, ReactElement } from 'react'

type ValidElement<Props = any> =
    | keyof Pick<HTMLElementTagNameMap, 'div' | 'header' | 'footer' | 'section' | 'main'>
    | ((props: Props) => ReactElement)

function Container<T extends ValidElement>({
    as,
    ...props
}: { as: T } & Omit<ComponentPropsWithoutRef<T>, 'as'>): ReactElement
function Container({ as, ...props }: { as?: undefined } & ComponentPropsWithoutRef<'div'>): ReactElement

function Container<T extends ValidElement>({
    as,
    className,
    ...props
}: { as?: T } & Omit<ComponentPropsWithoutRef<T>, 'as'>) {
    const Component = as ?? 'div'

    return <Component className={cn('mx-auto w-full max-w-[1440px] px-3 md:px-6', className)} {...props} />
}

export { Container }
