import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ChevronRight, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiClient, isApiClientError } from '@/api'
import {
  CARD,
  PAGE_TITLE,
  SECTION_HEADING,
  TD,
  TH,
  WELL,
} from '@/components/ui/tokens'
import { formatTimestamp } from '@/lib/datetime'

export function JuriTeamsPage() {
  const teamsQuery = useQuery({
    queryKey: ['juri', 'teams'],
    queryFn: ({ signal }) => apiClient.juri.listTeams(signal),
  })

  const teams = teamsQuery.data?.teams ?? []

  return (
    <div data-testid="juri-teams-page" className="space-y-6">
      <header>
        <h1 className={PAGE_TITLE}>Tim Final</h1>
      </header>

      <section className={`${CARD} p-6`} aria-labelledby="juri-teams-heading">
        <h2 id="juri-teams-heading" className={SECTION_HEADING}>
          Daftar tim
        </h2>

        {teamsQuery.isPending ? (
          <p data-testid="juri-teams-loading" className="mt-3 text-sm text-ink-3">
            Memuat daftar tim final...
          </p>
        ) : null}

        {teamsQuery.isError ? (
          <p
            data-testid="juri-teams-error"
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {isApiClientError(teamsQuery.error)
                ? teamsQuery.error.message
                : 'Gagal memuat daftar tim final.'}
            </span>
          </p>
        ) : null}

        {teamsQuery.isSuccess && teams.length === 0 ? (
          <div
            data-testid="juri-teams-empty-state"
            className={`mt-3 ${WELL} flex flex-col items-center gap-2 px-4 py-10 text-center`}
          >
            <Inbox className="h-6 w-6 text-ink-3" aria-hidden="true" />
            <p className="text-sm font-medium text-ink-2">Belum ada tim yang submit final</p>
            <p className="max-w-sm text-sm text-ink-3">
              Daftar ini terisi setelah peserta mengunci proposal, video, dan repository mereka.
            </p>
          </div>
        ) : null}

        {teams.length > 0 ? (
          <div className={`mt-3 ${WELL} overflow-x-auto`}>
            <table data-testid="juri-teams-table" className="w-full border-collapse">
              <caption className="sr-only">
                Tim yang sudah submit final, beserta jumlah anggota dan waktu finalisasi
              </caption>
              <thead>
                <tr className="border-b border-edge">
                  <th scope="col" className={TH}>
                    Nama tim
                  </th>
                  <th scope="col" className={TH}>
                    Anggota
                  </th>
                  <th scope="col" className={TH}>
                    Final pada
                  </th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    data-testid={`juri-team-row-${team.id}`}
                    className="border-b border-edge-soft last:border-b-0"
                  >
                    <td className={`${TD} font-medium text-ink`}>
                      <Link
                        to={`/juri/teams/${team.id}`}
                        className="inline-flex items-center gap-1.5 rounded transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
                      >
                        {team.name}
                        <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden="true" />
                      </Link>
                    </td>
                    <td className={`${TD} tabular-nums`}>{team.member_count}</td>
                    <td className={TD}>{formatTimestamp(team.finalized_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}
