import { Skeleton } from '@/components/base/skeleton'

export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col gap-4 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
        </div>
    )
}
