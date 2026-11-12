import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Check, ChevronRight, Inbox, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient, isApiClientError, VERIFICATION_STATUSES, type VerificationStatus } from '@/api'
import { Pagination } from '@/components/ui/Pagination'
import {
  CARD,
  FOCUS,
  INPUT,
  LABEL,
  PAGE_TITLE,
  SECTION_HEADING,
  TD,
  TH,
  WELL,
} from '@/components/ui/tokens'
import { VerificationStatusChip } from '@/components/ui/VerificationStatusChip'

const STATUS_FILTER_LABELS: Record<VerificationStatus, string> = {
  belum_lengkap: 'Belum lengkap',
  menunggu: 'Menunggu verifikasi',
  terverifikasi: 'Terverifikasi',
  ditolak: 'Ditolak',
}

const PAGE_SIZE = 25

export function AdminParticipantsPage() {
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | ''>('')
  const [page, setPage] = useState(1)

  const participantsQuery = useQuery({
    queryKey: ['admin', 'participants', statusFilter, page],
    queryFn: ({ signal }) =>
      apiClient.admin.listParticipants(
        {
          page,
          page_size: PAGE_SIZE,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
        signal,
      ),
  })

  const rows = participantsQuery.data?.items ?? []

  function handleStatusChange(next: string) {
    setStatusFilter(next as VerificationStatus | '')
    // A narrower filter can leave the current page past the end of the result.
    setPage(1)
  }

  return (
    <div data-testid="admin-participants-page" className="space-y-6">
      <header>
        <h1 className={PAGE_TITLE}>
          Verifikasi Peserta
        </h1>
      </header>

      <section className={`${CARD} p-6`} aria-labelledby="queue-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="queue-heading" className={SECTION_HEADING}>
            Antrean verifikasi
          </h2>

          <div>
            <label htmlFor="participants-status-filter" className={LABEL}>
              Filter status
            </label>
            <select
              id="participants-status-filter"
              data-testid="participants-status-filter"
              value={statusFilter}
              onChange={(event) => handleStatusChange(event.target.value)}
              className={`mt-1 ${INPUT} sm:w-64`}
            >
              <option value="">Semua status</option>
              {VERIFICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_FILTER_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {participantsQuery.isPending ? (
          <p data-testid="participants-loading" className="mt-3 text-sm text-ink-3">
            Memuat antrean peserta...
          </p>
        ) : null}

        {participantsQuery.isError ? (
          <p
            data-testid="participants-error"
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {isApiClientError(participantsQuery.error)
                ? participantsQuery.error.message
                : 'Gagal memuat antrean peserta.'}
            </span>
          </p>
        ) : null}

        {participantsQuery.isSuccess && rows.length === 0 ? (
          <div
            data-testid="participants-empty-state"
            className={`mt-3 ${WELL} flex flex-col items-center gap-2 px-4 py-10 text-center`}
          >
            <Inbox className="h-6 w-6 text-ink-3" aria-hidden="true" />
            <p className="text-sm font-medium text-ink-2">Tidak ada peserta pada filter ini</p>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <>
            <div className={`mt-3 ${WELL} overflow-x-auto`}>
              <table data-testid="participants-table" className="w-full border-collapse">
                <caption className="sr-only">
                  Peserta beserta status verifikasi, kelengkapan dokumen, dan timnya
                </caption>
                <thead>
                  <tr className="border-b border-edge">
                    <th scope="col" className={TH}>
                      Peserta
                    </th>
                    <th scope="col" className={TH}>
                      Institusi
                    </th>
                    <th scope="col" className={TH}>
                      Status
                    </th>
                    <th scope="col" className={TH}>
                      Dokumen
                    </th>
                    <th scope="col" className={TH}>
                      Tim
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.user_id}
                      data-testid={`participant-row-${row.user_id}`}
                      className="border-b border-edge-soft last:border-b-0"
                    >
                      <td className={TD}>
                        <Link
                          to={`/admin/participants/${row.user_id}`}
                          className={`inline-flex items-center gap-1.5 rounded font-medium text-ink transition hover:text-white ${FOCUS}`}
                        >
                          {row.full_name ?? '(nama belum diisi)'}
                          <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden="true" />
                        </Link>
                        <span className="mt-0.5 block text-xs break-all text-ink-3">
                          {row.email}
                        </span>
                        {row.is_minor ? (
                          <span className="mt-1 inline-flex rounded-full border border-amber-500/30 bg-amber-950/30 px-2 py-0.5 text-xs font-medium text-amber-200">
                            Di bawah umur
                          </span>
                        ) : null}
                      </td>
                      <td className={TD}>{row.institution ?? '—'}</td>
                      <td className={TD}>
                        <VerificationStatusChip status={row.verification_status} />
                      </td>
                      <td className={TD}>
                        <span className="inline-flex items-center gap-1.5">
                          {row.documents_complete ? (
                            <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                          ) : (
                            <X className="h-4 w-4 text-ink-3" aria-hidden="true" />
                          )}
                          {row.documents_complete ? 'Lengkap' : 'Belum lengkap'}
                        </span>
                      </td>
                      <td className={TD}>{row.team_name ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              testId="participants-pagination"
              page={participantsQuery.data?.page ?? page}
              pageSize={participantsQuery.data?.page_size ?? PAGE_SIZE}
              total={participantsQuery.data?.total ?? rows.length}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </section>
    </div>
  )
}
