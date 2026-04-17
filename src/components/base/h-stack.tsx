import { motion, type MotionProps } from 'motion/react'
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

const hStackVariants = cva('flex flex-wrap items-center', {
    variants: {
        align: {
            default: 'items-stretch',
            center: 'items items-center',
            start: 'items-start',
            end: 'items-end',
            baseline: 'items-baseline',
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
        noWrap: {
            true: 'flex-nowrap',
        },
        pos: {
            left: 'justify-start',
            right: 'justify-end',
            center: 'justify-center',
            apart: 'justify-between',
            around: 'justify-around',
            evenly: 'justify-evenly',
        },
    },
    defaultVariants: {
        spacing: 16,
        pos: 'left',
    },
})

export interface HStackProps extends MotionProps, VariantProps<typeof hStackVariants> {
    className?: string
    onClick?: React.MouseEventHandler<HTMLDivElement>
    ref?: React.Ref<HTMLDivElement>
}

const HStack = ({ className, noWrap, pos, align, spacing, children, ref, ...props }: HStackProps) => {
    return (
        <motion.div className={cn(hStackVariants({ spacing, align, className, noWrap, pos }))} ref={ref} {...props}>
            {children}
        </motion.div>
    )
}

export { HStack, hStackVariants }
