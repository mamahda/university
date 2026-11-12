import { AlertTriangle, Check, Circle, Clock, Info, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { PILL } from '@/components/ui/tokens'

export type StatusTone = 'approved' | 'review' | 'idle' | 'locked' | 'warning' | 'info'

const TONES: Record<StatusTone, { className: string; Icon: typeof Check }> = {
  approved: {
    className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
    Icon: Check,
  },
  review: {
    className: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
    Icon: Clock,
  },
  idle: {
    className: 'border-edge bg-white/5 text-ink-2',
    Icon: Circle,
  },
  locked: {
    className: 'border-rose-400/40 bg-rose-500/15 text-rose-200',
    Icon: Lock,
  },
  warning: {
    className: 'border-orange-400/40 bg-orange-500/15 text-orange-200',
    Icon: AlertTriangle,
  },
  info: {
    className: 'border-sky/40 bg-sky/15 text-sky',
    Icon: Info,
  },
}

/**
 * The reference portal's status chip. Tone never carries the meaning on its
 * own: every pill keeps its glyph and its written label.
 */
export function StatusPill({
  tone,
  children,
  testId,
}: {
  tone: StatusTone
  children: ReactNode
  testId?: string
}) {
  const { className, Icon } = TONES[tone]

  return (
    <span data-testid={testId} className={`${PILL} ${className}`}>
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {children}
    </span>
  )
}
