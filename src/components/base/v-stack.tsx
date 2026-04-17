import { cn } from '@/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type MotionProps } from 'motion/react'
import React from 'react'

const vStackVariants = cva('flex flex-col gap-2', {
    variants: {
        align: {
            default: 'items-stretch',
            center: 'items items-center',
            start: 'items-start',
            end: 'items-end',
            baseline: 'items-baseline',
        },
        justify: {
            default: 'justify-start',
            center: 'justify-center',
            start: 'justify-start',
            between: 'justify-between',
            end: 'justify-end',
            evenly: 'justify-evenly',
            around: 'justify-around',
        },
        spacing: {
            0: 'gap-0',
            2: 'gap-0.5',
            4: 'gap-1',
            6: 'gap-1.5',
            8: 'gap-2',
            10: 'gap-2.5',
            12: 'gap-3',
            16: 'gap-4',
            20: 'gap-5',
            24: 'gap-6',
            32: 'gap-8',
            40: 'gap-10',
            48: 'gap-12',
            64: 'gap-16',
            none: 'gap-0',
        },
    },
    defaultVariants: {
        spacing: 4,
        align: 'default',
        justify: 'default',
    },
})

export interface VStackProps extends MotionProps, VariantProps<typeof vStackVariants> {
    className?: string
    ref?: React.Ref<HTMLDivElement>
}

const VStack = ({ className, spacing, align, justify, children, ref, ...props }: VStackProps) => {
    return (
        <motion.div className={cn(vStackVariants({ spacing, align, justify, className }))} ref={ref} {...props}>
            {children}
        </motion.div>
    )
}

export { VStack, vStackVariants }
