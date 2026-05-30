import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'gray'
  className?: string
}

export default function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-emerald-100 text-emerald-700': variant === 'green',
          'bg-blue-100 text-blue-700': variant === 'blue',
          'bg-yellow-100 text-yellow-700': variant === 'yellow',
          'bg-red-100 text-red-700': variant === 'red',
          'bg-slate-100 text-slate-600': variant === 'gray',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
