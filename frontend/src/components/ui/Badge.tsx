import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'red' | 'yellow' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'muted', className }: BadgeProps) {
  const variants = {
    green: 'bg-dash-green/10 text-dash-green border border-dash-green/20',
    red: 'bg-dash-red/10 text-dash-red border border-dash-red/20',
    yellow: 'bg-dash-yellow/10 text-dash-yellow border border-dash-yellow/20',
    muted: 'bg-white/5 text-dash-muted border border-white/5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium font-mono',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
