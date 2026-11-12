import { Check, Clock, FileWarning, X } from 'lucide-react'
import type { VerificationStatus } from '@/api'

/**
 * Status is never carried by color alone: each state keeps its own glyph and
 * label so it survives a monochrome render and a screen reader.
 */
const STATUS_COPY: Record<
  VerificationStatus,
  { label: string; className: string; Icon: typeof Check }
> = {
  belum_lengkap: {
    label: 'Belum lengkap',
    className: 'border-edge bg-well text-ink-2',
    Icon: FileWarning,
  },
  menunggu: {
    label: 'Menunggu verifikasi',
    className: 'border-amber-500/30 bg-amber-950/30 text-amber-200',
    Icon: Clock,
  },
  terverifikasi: {
    label: 'Terverifikasi',
    className: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200',
    Icon: Check,
  },
  ditolak: {
    label: 'Ditolak',
    className: 'border-red-500/40 bg-red-950/30 text-red-200',
    Icon: X,
  },
}

export function VerificationStatusChip({
  status,
  testId,
}: {
  status: VerificationStatus
  testId?: string
}) {
  const { label, className, Icon } = STATUS_COPY[status]

  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}
