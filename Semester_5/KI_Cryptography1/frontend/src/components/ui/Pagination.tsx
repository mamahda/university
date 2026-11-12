import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BTN_SECONDARY } from '@/components/ui/tokens'

interface PaginationProps {
  testId: string
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

/** Server-side pagination: `page` is 1-based, matching the API contract. */
export function Pagination({ testId, page, pageSize, total, onPageChange }: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <nav
      data-testid={testId}
      aria-label="Navigasi halaman"
      className="mt-3 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-ink-3" aria-live="polite">
        Menampilkan <span className="tabular-nums text-ink-2">{first}</span>–
        <span className="tabular-nums text-ink-2">{last}</span> dari{' '}
        <span className="tabular-nums text-ink-2">{total}</span> data · halaman{' '}
        <span className="tabular-nums text-ink-2">{page}</span> dari{' '}
        <span className="tabular-nums text-ink-2">{lastPage}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          data-testid="page-prev"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={BTN_SECONDARY}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Sebelumnya
        </button>
        <button
          type="button"
          data-testid="page-next"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          className={BTN_SECONDARY}
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
