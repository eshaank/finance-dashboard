import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded bg-white/[0.04] animate-pulse', className)} />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function TableRowSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5">
      <Skeleton className="h-4 w-1/4 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
