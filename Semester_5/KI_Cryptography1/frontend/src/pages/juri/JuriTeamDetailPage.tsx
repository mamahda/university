import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, Crown, ExternalLink, GitBranch } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { apiClient, isApiClientError } from '@/api'
import { ItemBlobViewer } from '@/components/ui/ItemBlobViewer'
import {
  CARD,
  FOCUS,
  PAGE_TITLE,
  SECTION_HEADING,
  WELL,
} from '@/components/ui/tokens'
import { formatTimestamp } from '@/lib/datetime'

export function JuriTeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>()

  const detailQuery = useQuery({
    queryKey: ['juri', 'teams', teamId],
    queryFn: ({ signal }) => apiClient.juri.getTeamDetail(teamId as string, signal),
    enabled: Boolean(teamId),
  })

  const team = detailQuery.data?.team

  return (
    <div className="space-y-6">
      <Link
        to="/juri/teams"
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 transition hover:text-white ${FOCUS}`}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar tim
      </Link>

      {detailQuery.isPending ? (
        <p data-testid="juri-detail-loading" className={`${CARD} p-6 text-sm text-ink-3`}>
          Memuat berkas tim...
        </p>
      ) : null}

      {detailQuery.isError ? (
        <p
          data-testid="juri-detail-error"
          role="alert"
          className={`${CARD} flex items-start gap-2 p-6 text-sm text-red-200`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {isApiClientError(detailQuery.error) && detailQuery.error.status === 404
              ? 'Tim tidak ditemukan atau belum submit final, sehingga berkasnya belum dibuka untuk juri.'
              : isApiClientError(detailQuery.error)
                ? detailQuery.error.message
                : 'Gagal memuat berkas tim.'}
          </span>
        </p>
      ) : null}

      {team ? (
        <div data-testid="juri-team-detail" className="space-y-6">
          <header>
            <h1 className={PAGE_TITLE}>{team.name}</h1>
            <p className="mt-1.5 text-sm text-ink-3">
              Dikunci final pada {formatTimestamp(team.finalized_at, 'long')}
            </p>
          </header>

          <section className={`${CARD} p-6`} aria-labelledby="juri-members-heading">
            <h2 id="juri-members-heading" className={SECTION_HEADING}>
              Anggota tim
            </h2>
            <ul data-testid="juri-team-members" className="mt-3 space-y-2">
              {team.members.map((member, index) => (
                <li
                  key={`${member.full_name ?? 'anggota'}-${index}`}
                  className={`${WELL} flex flex-wrap items-center justify-between gap-2 px-3 py-2.5`}
                >
                  <span className="text-sm font-medium text-ink">
                    {member.full_name ?? '(nama belum diisi)'}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm text-ink-3">
                      {member.institution ?? '(institusi belum diisi)'}
                    </span>
                    {member.is_leader ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-950/30 px-2 py-0.5 text-xs font-medium text-amber-200">
                        <Crown className="h-3 w-3" aria-hidden="true" />
                        Ketua
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${CARD} p-6`} aria-labelledby="juri-artifacts-heading">
            <h2 id="juri-artifacts-heading" className={SECTION_HEADING}>
              Berkas submission
            </h2>

            <div className="mt-3 space-y-4">
              <ItemBlobViewer
                field="proposal"
                label="Proposal PDF"
                item={team.proposal}
                emptyText="Tidak ada berkas yang disubmit."
              />
              <ItemBlobViewer
                field="video"
                label="Video Demo MP4"
                item={team.video}
                emptyText="Tidak ada berkas yang disubmit."
              />

              <article data-testid="artifact-repo" className={`${WELL} p-4`}>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <GitBranch className="h-4 w-4 text-ink-3" aria-hidden="true" />
                  Repository GitHub
                </h3>
                {team.repo_url ? (
                  <a
                    data-testid="artifact-repo-link"
                    href={team.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-1 inline-flex items-center gap-1.5 text-sm break-all text-ink-2 underline decoration-ink-3 underline-offset-4 transition hover:text-white hover:decoration-sky ${FOCUS}`}
                  >
                    {team.repo_url}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="sr-only">(terbuka di tab baru)</span>
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-ink-3">Tidak ada repository yang disubmit.</p>
                )}
              </article>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
