import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Filter, Inbox } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { apiClient, AUDIT_ACTIONS, isApiClientError, type AuditAction } from '@/api'
import { Pagination } from '@/components/ui/Pagination'
import {
  BTN_SECONDARY,
  CARD,
  INPUT,
  LABEL,
  PAGE_TITLE,
  RECESSED,
  SECTION_HEADING,
  TD,
  TH,
  WELL,
} from '@/components/ui/tokens'
import { formatTimestamp } from '@/lib/datetime'

const ACTION_LABELS: Record<AuditAction, string> = {
  view_profile: 'Membuka profil peserta',
  view_item: 'Membuka berkas terenkripsi',
  verify_participant: 'Memutuskan verifikasi peserta',
  create_juri: 'Membuat akun juri',
  assign_juri: 'Menugaskan juri ke tim',
  update_settings: 'Mengubah pengaturan',
  integrity_failure: 'Kegagalan integritas ciphertext',
  login_failed: 'Login gagal',
}

/**
 * The API records the action as free text, so an action this build does not
 * know yet falls back to its raw value instead of rendering blank.
 */
function actionLabel(action: string): string {
  return ACTION_LABELS[action as AuditAction] ?? action
}

interface AuditFilters {
  actorId: string
  action: AuditAction | ''
  from: string
  to: string
}

const EMPTY_FILTERS: AuditFilters = { actorId: '', action: '', from: '', to: '' }

const PAGE_SIZE = 25

export function AdminAuditLogsPage() {
  /** `draft` is what the admin is typing; `applied` is what the server is asked for. */
  const [draft, setDraft] = useState<AuditFilters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<AuditFilters>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)

  const logsQuery = useQuery({
    queryKey: ['admin', 'audit-logs', applied, page],
    queryFn: ({ signal }) =>
      apiClient.admin.listAuditLogs(
        {
          page,
          page_size: PAGE_SIZE,
          ...(applied.actorId ? { actor_id: applied.actorId } : {}),
          ...(applied.action ? { action: applied.action } : {}),
          ...(applied.from ? { from: applied.from } : {}),
          ...(applied.to ? { to: applied.to } : {}),
        },
        signal,
      ),
  })

  const rows = logsQuery.data?.items ?? []

  function applyFilters(next: AuditFilters) {
    setDraft(next)
    setApplied(next)
    setPage(1)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    applyFilters(draft)
  }

  return (
    <div data-testid="admin-audit-logs-page" className="space-y-6">
      <header>
        <h1 className={PAGE_TITLE}>Audit Log</h1>
      </header>

      <section className={`${CARD} p-6`} aria-labelledby="audit-heading">
        <h2 id="audit-heading" className={SECTION_HEADING}>
          Jejak aktivitas
        </h2>

        <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="audit-actor-filter" className={LABEL}>
              Actor ID
            </label>
            <input
              id="audit-actor-filter"
              data-testid="audit-actor-filter"
              type="text"
              spellCheck={false}
              value={draft.actorId}
              onChange={(event) => setDraft({ ...draft, actorId: event.target.value })}
              placeholder="UUID pengguna"
              className={`mt-1 ${INPUT} font-mono text-xs`}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="audit-action-filter" className={LABEL}>
              Aksi
            </label>
            <select
              id="audit-action-filter"
              data-testid="audit-action-filter"
              value={draft.action}
              onChange={(event) =>
                // A select needs no explicit apply: the choice is already final.
                applyFilters({ ...draft, action: event.target.value as AuditAction | '' })
              }
              className={`mt-1 ${INPUT}`}
            >
              <option value="">Semua aksi</option>
              {AUDIT_ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {ACTION_LABELS[action]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="audit-from-filter" className={LABEL}>
              Dari tanggal
            </label>
            <input
              id="audit-from-filter"
              data-testid="audit-from-filter"
              type="date"
              value={draft.from}
              onChange={(event) => setDraft({ ...draft, from: event.target.value })}
              className={`mt-1 ${INPUT}`}
            />
          </div>

          <div>
            <label htmlFor="audit-to-filter" className={LABEL}>
              Sampai tanggal
            </label>
            <input
              id="audit-to-filter"
              data-testid="audit-to-filter"
              type="date"
              value={draft.to}
              onChange={(event) => setDraft({ ...draft, to: event.target.value })}
              className={`mt-1 ${INPUT}`}
            />
          </div>

          <div className="flex items-end gap-2 sm:col-span-2">
            <button type="submit" data-testid="audit-apply-btn" className={BTN_SECONDARY}>
              <Filter className="h-4 w-4" aria-hidden="true" />
              Terapkan filter
            </button>
            <button
              type="button"
              data-testid="audit-reset-btn"
              onClick={() => applyFilters(EMPTY_FILTERS)}
              className={BTN_SECONDARY}
            >
              Reset
            </button>
          </div>
        </form>

        {logsQuery.isPending ? (
          <p data-testid="audit-logs-loading" className="mt-3 text-sm text-ink-3">
            Memuat audit log...
          </p>
        ) : null}

        {logsQuery.isError ? (
          <p
            data-testid="audit-logs-error"
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {isApiClientError(logsQuery.error)
                ? logsQuery.error.message
                : 'Gagal memuat audit log.'}
            </span>
          </p>
        ) : null}

        {logsQuery.isSuccess && rows.length === 0 ? (
          <div
            data-testid="audit-logs-empty-state"
            className={`mt-3 ${WELL} flex flex-col items-center gap-2 px-4 py-10 text-center`}
          >
            <Inbox className="h-6 w-6 text-ink-3" aria-hidden="true" />
            <p className="text-sm font-medium text-ink-2">
              Tidak ada entri pada filter ini
            </p>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <>
            <div className={`mt-3 ${WELL} overflow-x-auto`}>
              <table data-testid="audit-logs-table" className="w-full border-collapse">
                <caption className="sr-only">
                  Entri audit log terbaru lebih dahulu, beserta aktor, aksi, dan objeknya
                </caption>
                <thead>
                  <tr className="border-b border-edge">
                    <th scope="col" className={TH}>
                      Waktu
                    </th>
                    <th scope="col" className={TH}>
                      Aktor
                    </th>
                    <th scope="col" className={TH}>
                      Aksi
                    </th>
                    <th scope="col" className={TH}>
                      Objek
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry) => (
                    <tr
                      key={entry.id}
                      data-testid={`audit-row-${entry.id}`}
                      className="border-b border-edge-soft last:border-b-0"
                    >
                      <td className={`${TD} whitespace-nowrap`}>
                        {formatTimestamp(entry.created_at)}
                      </td>
                      <td className={TD}>
                        {entry.actor_email ? (
                          <>
                            <span className="block break-all text-ink-2">
                              {entry.actor_email}
                            </span>
                            <span className="text-xs text-ink-3">{entry.actor_role}</span>
                          </>
                        ) : (
                          <span className="text-ink-3">Sistem (tanpa aktor)</span>
                        )}
                      </td>
                      <td className={TD}>
                        <span className="block text-ink-2">{actionLabel(entry.action)}</span>
                        <code className="text-xs text-ink-3">{entry.action}</code>
                      </td>
                      <td className={TD}>
                        {entry.item_id ? (
                          <span className={`${RECESSED} block px-2 py-1 font-mono text-xs break-all text-ink-2`}>
                            item {entry.item_id}
                          </span>
                        ) : null}
                        {entry.subject_user_id ? (
                          <span className={`${RECESSED} mt-1 block px-2 py-1 font-mono text-xs break-all text-ink-2`}>
                            user {entry.subject_user_id}
                          </span>
                        ) : null}
                        {!entry.item_id && !entry.subject_user_id ? (
                          <span className="text-ink-3">—</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              testId="audit-logs-pagination"
              page={logsQuery.data?.page ?? page}
              pageSize={logsQuery.data?.page_size ?? PAGE_SIZE}
              total={logsQuery.data?.total ?? rows.length}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </section>
    </div>
  )
}
