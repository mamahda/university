import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Check,
  Copy,
  Crown,
  DoorOpen,
  FileCheck2,
  FileText,
  GitBranch,
  ListChecks,
  Lock,
  LogIn,
  RefreshCw,
  Send,
  UserMinus,
  UserPlus,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  apiClient,
  isApiClientError,
  type FinalizeMissingItem,
  type Team,
  type TeamMember,
} from '@/api'
import { formatBytes, PROPOSAL_MAX_BYTES, validateProposalFile } from '@/lib/fileValidation'
import { validateInviteCode, validateRepoUrl, validateTeamName } from '@/lib/teamValidation'
import { useAuthStore } from '@/stores/authStore'
import { SECTION_HEADING } from '@/components/ui/tokens'

const TEAM_STATUS_COPY: Record<Team['status'], { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'border-amber-500/30 bg-amber-950/30 text-amber-200',
  },
  final: {
    label: 'Final (Terkunci)',
    className: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200',
  },
}

const FINALIZE_MISSING_LABELS: Record<FinalizeMissingItem, string> = {
  proposal: 'Proposal PDF belum diunggah',
  video: 'Video Demo MP4 belum diunggah',
  repo_url: 'URL Repositori GitHub belum disimpan',
  min_members: 'Jumlah anggota tim belum mencapai batas minimum',
  members_incomplete: 'Masih ada anggota yang belum melengkapi profil/dokumen',
}

/** Which destructive action is awaiting its second confirmation click. */
type PendingConfirm = { kind: 'leave' } | { kind: 'kick'; userId: string } | null

function describeError(error: unknown, fallback: string): string {
  return isApiClientError(error) ? error.message : fallback
}

function isMemberReady(member: TeamMember): boolean {
  return member.profile_complete && member.documents_complete
}

function ReadinessChip({ ready, label }: { ready: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
        ready
          ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
          : 'border-edge-soft bg-panel text-ink-3'
      }`}
    >
      {ready ? (
        <Check className="h-3 w-3" aria-hidden="true" />
      ) : (
        <X className="h-3 w-3" aria-hidden="true" />
      )}
      {label}
    </span>
  )
}

export function TeamSection() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((state) => state.user?.id ?? null)

  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  const proposalInputRef = useRef<HTMLInputElement>(null)
  const [proposalError, setProposalError] = useState<string | null>(null)
  const [proposalPercent, setProposalPercent] = useState<number | null>(null)
  const [repoUrl, setRepoUrl] = useState('')
  const [repoError, setRepoError] = useState<string | null>(null)
  const [finalizeOpen, setFinalizeOpen] = useState(false)

  const teamQuery = useQuery({
    queryKey: ['teams', 'me'],
    queryFn: ({ signal }) => apiClient.teams.getMine(signal),
  })

  const team = teamQuery.data?.team ?? null
  const isLeader = Boolean(team && currentUserId && team.leader_id === currentUserId)
  const isLocked = team?.status === 'final'
  const readyMembersCount = team ? team.members.filter(isMemberReady).length : 0

  function applyTeam(next: Team | null) {
    queryClient.setQueryData(['teams', 'me'], { team: next })
    setPendingConfirm(null)
    setActionError(null)
  }

  const createMutation = useMutation({
    mutationFn: (name: string) => apiClient.teams.create({ name }),
    onSuccess: ({ team: created }) => {
      setTeamName('')
      applyTeam(created)
    },
    onError: (error) => setFormError(describeError(error, 'Tim gagal dibuat. Coba lagi.')),
  })

  const joinMutation = useMutation({
    mutationFn: (code: string) => apiClient.teams.join({ code }),
    onSuccess: ({ team: joined }) => {
      setInviteCode('')
      applyTeam(joined)
    },
    onError: (error) =>
      setFormError(describeError(error, 'Gagal bergabung ke tim. Periksa kode tim.')),
  })

  const leaveMutation = useMutation({
    mutationFn: () => apiClient.teams.leave(),
    onSuccess: () => applyTeam(null),
    onError: (error) => {
      setPendingConfirm(null)
      setActionError(describeError(error, 'Gagal keluar dari tim.'))
    },
  })

  const proposalMutation = useMutation({
    mutationFn: (file: File) =>
      apiClient.teams.uploadProposal(file, {
        filename: file.name,
        onProgress: (progress) => setProposalPercent(progress.percent),
      }),
    onSuccess: (uploaded) => {
      setProposalPercent(null)
      if (team) {
        applyTeam({ ...team, submission: { ...team.submission, proposal: uploaded } })
      }
      void queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
    },
    onError: (error) => {
      setProposalPercent(null)
      setProposalError(describeError(error, 'Proposal gagal diunggah.'))
    },
  })

  const repoMutation = useMutation({
    mutationFn: (url: string) => apiClient.teams.updateRepo({ repo_url: url }),
    onSuccess: ({ repo_url }) => {
      setRepoUrl('')
      if (team) {
        applyTeam({ ...team, submission: { ...team.submission, repo_url } })
      }
      void queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })
    },
    onError: (error) => {
      setRepoError(describeError(error, 'Link repositori gagal disimpan.'))
    },
  })

  const finalizeMutation = useMutation({
    mutationFn: () => apiClient.teams.finalize({ confirm: true }),
    onSuccess: ({ team: finalized }) => {
      setFinalizeOpen(false)
      applyTeam(finalized)
    },
    onError: (error) => {
      setFinalizeOpen(false)
      setActionError(describeError(error, 'Submit final gagal.'))
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => apiClient.teams.removeMember(userId),
    onSuccess: (_result, userId) => {
      if (team) {
        applyTeam({ ...team, members: team.members.filter((m) => m.user_id !== userId) })
      }
    },
    onError: (error) => {
      setPendingConfirm(null)
      setActionError(describeError(error, 'Gagal mengeluarkan anggota.'))
    },
  })

  const isBusy =
    createMutation.isPending ||
    joinMutation.isPending ||
    leaveMutation.isPending ||
    removeMemberMutation.isPending ||
    proposalMutation.isPending ||
    repoMutation.isPending ||
    finalizeMutation.isPending

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    setActionError(null)
    const error = validateTeamName(teamName)
    if (error) {
      setFormError(error)
      return
    }
    setFormError(null)
    createMutation.mutate(teamName.trim())
  }

  function handleJoin(event: FormEvent) {
    event.preventDefault()
    setActionError(null)
    const error = validateInviteCode(inviteCode)
    if (error) {
      setFormError(error)
      return
    }
    setFormError(null)
    joinMutation.mutate(inviteCode.trim())
  }

  async function handleProposalChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }
    setActionError(null)
    const result = await validateProposalFile(file)
    if (!result.valid) {
      setProposalError(result.errorMessage)
      return
    }
    setProposalError(null)
    proposalMutation.mutate(file)
  }

  function handleRepoSubmit(event: FormEvent) {
    event.preventDefault()
    setActionError(null)
    const error = validateRepoUrl(repoUrl)
    if (error) {
      setRepoError(error)
      return
    }
    setRepoError(null)
    repoMutation.mutate(repoUrl.trim())
  }

  async function handleCopyCode() {
    if (!team) {
      return
    }
    try {
      await navigator.clipboard.writeText(team.code)
      setCodeCopied(true)
      window.setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      setActionError('Kode tim gagal disalin. Salin manual dari kotak kode.')
    }
  }

  if (teamQuery.isLoading) {
    return (
      <section
        data-testid="team-workspace-page"
        className="rounded-2xl border border-edge bg-panel p-6 text-sm text-ink-3"
      >
        Memuat data tim...
      </section>
    )
  }

  if (teamQuery.isError) {
    return (
      <section
        data-testid="team-workspace-page"
        className="rounded-2xl border border-edge bg-panel p-6"
      >
        <div
          data-testid="team-error-alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          <span>{describeError(teamQuery.error, 'Data tim gagal dimuat.')}</span>
          <button
            type="button"
            onClick={() => void teamQuery.refetch()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-500/40 px-2.5 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-950/50"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Coba Muat Ulang
          </button>
        </div>
      </section>
    )
  }

  return (
    <section data-testid="team-workspace-page" className="space-y-5">
      <header className="flex items-start gap-3 px-1">
        <Users className="mt-1 h-6 w-6 shrink-0 text-sky" aria-hidden="true" />
        <h2 className="text-xl font-bold tracking-tight text-white">
          Team &amp; Submission Workspace
        </h2>
      </header>

      {actionError && (
        <div
          data-testid="team-error-alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      {!team ? (
        <div data-testid="team-empty-state" className="grid gap-5 md:grid-cols-2">
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-edge bg-panel p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <UserPlus className="h-4.5 w-4.5 text-ink-3" aria-hidden="true" />
              Buat Tim Baru
            </h2>

            <label htmlFor="team-name" className="mt-4 block text-sm font-medium text-ink-2">
              Nama Tim
            </label>
            <input
              id="team-name"
              name="name"
              type="text"
              value={teamName}
              maxLength={50}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Tim Garuda"
              className="mt-1.5 w-full rounded-xl border border-edge bg-well px-3 py-2 text-sm text-ink outline-none transition focus:border-edge"
            />

            <button
              type="submit"
              disabled={isBusy}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-sky px-4 py-2.5 text-sm font-medium text-black transition hover:bg-sky-soft disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {createMutation.isPending ? 'Membuat Tim...' : 'Buat Tim'}
            </button>
          </form>

          <form
            onSubmit={handleJoin}
            className="rounded-2xl border border-edge bg-panel p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <LogIn className="h-4.5 w-4.5 text-ink-3" aria-hidden="true" />
              Gabung Tim
            </h2>
            <p className="mt-1.5 text-sm text-ink-3">
              Masukkan kode tim 8 karakter. Huruf besar-kecil tidak dibedakan.
            </p>

            <label
              htmlFor="invite-code-input"
              className="mt-4 block text-sm font-medium text-ink-2"
            >
              Kode Tim
            </label>
            <input
              id="invite-code-input"
              name="code"
              type="text"
              value={inviteCode}
              maxLength={8}
              autoComplete="off"
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="K7M2Q9XA"
              className="mt-1.5 w-full rounded-xl border border-edge bg-well px-3 py-2 font-mono text-sm tracking-widest text-ink uppercase outline-none transition focus:border-edge"
            />

            <button
              type="submit"
              disabled={isBusy}
              className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge bg-well px-4 py-2 text-sm font-medium text-white transition hover:border-sky/70 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {joinMutation.isPending ? 'Menggabungkan...' : 'Gabung Tim'}
            </button>
          </form>

          {formError && (
            <p
              data-testid="team-form-error"
              className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200 md:col-span-2"
            >
              {formError}
            </p>
          )}
        </div>
      ) : (
        <div
          data-testid="team-card"
          className="rounded-2xl border border-edge bg-panel p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">{team.name}</h2>
              <p className="mt-1 text-xs text-ink-3">
                Peran Anda: {isLeader ? 'Ketua Tim' : 'Anggota'}
              </p>
            </div>
            <span
              data-testid="team-section-status-badge"
              className={`rounded-full border px-3 py-1 text-xs font-medium ${TEAM_STATUS_COPY[team.status].className}`}
            >
              {TEAM_STATUS_COPY[team.status].label}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-edge bg-well px-3.5 py-3">
            <div>
              <p className="text-xs text-ink-3">Kode Tim</p>
              <code
                data-testid="invite-code"
                className="mt-0.5 block rounded border border-edge-soft bg-well px-2 py-1 font-mono text-base tracking-[0.3em] text-ink"
              >
                {team.code}
              </code>
            </div>
            <button
              type="button"
              onClick={() => void handleCopyCode()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge bg-panel px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-sky/70 hover:text-white"
            >
              {codeCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {codeCopied ? 'Tersalin' : 'Salin Kode'}
            </button>
          </div>

          {isLocked && (
            <p
              data-testid="team-locked-notice"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-3 text-sm text-emerald-200"
            >
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Tim sudah final dan terkunci untuk penjurian. Keanggotaan tidak dapat diubah lagi.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink-2">Kesiapan Anggota</h3>
            <span
              data-testid="member-readiness-summary"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2"
            >
              <FileCheck2 className="h-3.5 w-3.5 text-ink-3" aria-hidden="true" />
              {readyMembersCount}/{team.members.length} anggota lengkap
            </span>
          </div>

          <ul data-testid="member-list" className="mt-2 space-y-2">
            {team.members.map((member) => {
              const displayName = member.full_name ?? 'Peserta tanpa nama'
              const isSelf = member.user_id === currentUserId
              const confirmingKick =
                pendingConfirm?.kind === 'kick' && pendingConfirm.userId === member.user_id

              return (
                <li
                  key={member.user_id}
                  data-testid="member-row"
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-edge bg-well px-3.5 py-2.5 text-sm"
                >
                  <span className="flex flex-wrap items-center gap-2 text-ink-2">
                    {displayName}
                    {member.is_leader && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-950/30 px-2 py-0.5 text-xs text-amber-200">
                        <Crown className="h-3 w-3" aria-hidden="true" />
                        Ketua
                      </span>
                    )}
                    {isSelf && <span className="text-xs text-ink-3">(Anda)</span>}
                    <ReadinessChip ready={member.profile_complete} label="Profil" />
                    <ReadinessChip ready={member.documents_complete} label="Dokumen" />
                  </span>

                  {isLeader && !isLocked && !member.is_leader && (
                    <span className="flex items-center gap-2">
                      {confirmingKick ? (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => removeMemberMutation.mutate(member.user_id)}
                            className="cursor-pointer rounded-xl border border-red-500/40 bg-red-950/40 px-2.5 py-1 text-xs font-medium text-red-100 transition hover:bg-red-950/60 disabled:opacity-50"
                          >
                            Ya, Keluarkan
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingConfirm(null)}
                            className="cursor-pointer rounded-xl border border-edge px-2.5 py-1 text-xs text-ink-2 transition hover:border-sky/70"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Keluarkan ${displayName}`}
                          onClick={() =>
                            setPendingConfirm({ kind: 'kick', userId: member.user_id })
                          }
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge px-2.5 py-1 text-xs text-ink-2 transition hover:border-red-500/50 hover:text-red-200"
                        >
                          <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
                          Keluarkan
                        </button>
                      )}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>

          {isLeader && (
            <div
              data-testid="leader-submission-section"
              className="mt-6 space-y-4 border-t border-edge pt-5"
            >
              <h3 className="text-sm font-semibold text-ink-2">Submission Ketua Tim</h3>

              {/* Proposal PDF (max 10 MB) */}
              <div className="rounded-xl border border-edge bg-well px-3.5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-ink-2">
                    <FileText className="h-4 w-4 text-ink-3" aria-hidden="true" />
                    Proposal PDF
                  </span>
                  <span className="text-xs text-ink-3">
                    Maksimal {formatBytes(PROPOSAL_MAX_BYTES)}
                  </span>
                </div>

                {team.submission.proposal ? (
                  <p data-testid="proposal-meta" className="mt-2 text-xs text-ink-3">
                    {team.submission.proposal.original_filename} ·{' '}
                    {formatBytes(team.submission.proposal.size_bytes)}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-ink-3">Belum ada proposal yang diunggah.</p>
                )}

                {!isLocked && (
                  <>
                    <input
                      ref={proposalInputRef}
                      id="file-input-proposal"
                      data-testid="file-input-proposal"
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      onChange={(event) => void handleProposalChange(event)}
                    />
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => proposalInputRef.current?.click()}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge bg-panel px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-sky/70 hover:text-white disabled:opacity-50"
                    >
                      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                      {team.submission.proposal ? 'Ganti Proposal' : 'Unggah Proposal'}
                    </button>
                  </>
                )}

                {proposalPercent !== null && (
                  <div
                    data-testid="proposal-progress"
                    className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-edge-soft"
                  >
                    <div
                      className="h-full bg-sky transition-[width]"
                      style={{ width: `${proposalPercent}%` }}
                    />
                  </div>
                )}

                {proposalError && (
                  <p
                    data-testid="proposal-error"
                    className="mt-2 rounded-xl border border-red-500/30 bg-red-950/30 px-2.5 py-1.5 text-xs text-red-200"
                  >
                    {proposalError}
                  </p>
                )}
              </div>

              {/* GitHub repository URL */}
              <div className="rounded-xl border border-edge bg-well px-3.5 py-3">
                <span className="flex items-center gap-2 text-sm text-ink-2">
                  <GitBranch className="h-4 w-4 text-ink-3" aria-hidden="true" />
                  Repositori GitHub
                </span>

                {team.submission.repo_url ? (
                  <p data-testid="repo-url-value" className="mt-2 break-all text-xs text-ink-3">
                    {team.submission.repo_url}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-ink-3">Belum ada link repositori.</p>
                )}

                {!isLocked && (
                  <form onSubmit={handleRepoSubmit} className="mt-3">
                    <label
                      htmlFor="repo-url-input"
                      className="block text-xs font-medium text-ink-3"
                    >
                      URL Repositori GitHub
                    </label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <input
                        id="repo-url-input"
                        name="repo_url"
                        type="url"
                        value={repoUrl}
                        onChange={(event) => setRepoUrl(event.target.value)}
                        placeholder="https://github.com/tim-garuda/schematics-app"
                        className="min-w-0 flex-1 rounded-xl border border-edge bg-well px-3 py-2 text-sm text-ink outline-none transition focus:border-edge"
                      />
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge bg-panel px-3 py-2 text-xs font-medium text-ink-2 transition hover:border-sky/70 hover:text-white disabled:opacity-50"
                      >
                        {repoMutation.isPending ? 'Menyimpan...' : 'Simpan Link'}
                      </button>
                    </div>
                  </form>
                )}

                {repoError && (
                  <p
                    data-testid="repo-error"
                    className="mt-2 rounded-xl border border-red-500/30 bg-red-950/30 px-2.5 py-1.5 text-xs text-red-200"
                  >
                    {repoError}
                  </p>
                )}
              </div>

              {/* finalize_missing checklist + two-step finalize */}
              {!isLocked && (
                <div className="rounded-xl border border-edge bg-well px-3.5 py-3">
                  <span className="flex items-center gap-2 text-sm text-ink-2">
                    <ListChecks className="h-4 w-4 text-ink-3" aria-hidden="true" />
                    Syarat Submit Final
                  </span>

                  {team.finalize_missing.length === 0 ? (
                    <p
                      data-testid="finalize-checklist"
                      className="mt-2 flex items-center gap-1.5 text-xs text-emerald-200"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      Semua syarat sudah terpenuhi.
                    </p>
                  ) : (
                    <ul
                      data-testid="finalize-checklist"
                      className="mt-2 list-inside list-disc space-y-0.5 text-xs text-ink-3"
                    >
                      {team.finalize_missing.map((item) => (
                        <li key={item}>{FINALIZE_MISSING_LABELS[item]}</li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    disabled={isBusy || team.finalize_missing.length > 0}
                    onClick={() => setFinalizeOpen(true)}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-sky px-4 py-2.5 text-sm font-medium text-black transition hover:bg-sky-soft disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Submit Final
                  </button>
                </div>
              )}
            </div>
          )}

          {finalizeOpen && (
            <div
              data-testid="finalize-confirm-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="finalize-modal-title"
              className="fixed inset-0 z-40 flex items-center justify-center bg-well/80 px-4"
            >
              <div className="w-full max-w-md rounded-2xl border border-edge bg-panel p-6 shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
                <h2 id="finalize-modal-title" className={SECTION_HEADING}>
                  Konfirmasi Submit Final
                </h2>
                <p className="mt-2 text-sm text-ink-3">
                  Setelah submit final, data tim dan seluruh berkas submission{' '}
                  <strong className="text-ink-2">terkunci permanen</strong> dan diteruskan ke
                  juri. Keanggotaan, proposal, video, dan link repositori tidak dapat diubah lagi.
                </p>
                <div className="mt-5 flex flex-wrap justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFinalizeOpen(false)}
                    className="cursor-pointer rounded-xl border border-edge px-3.5 py-2 text-sm text-ink-2 transition hover:border-sky/70"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={finalizeMutation.isPending}
                    onClick={() => finalizeMutation.mutate()}
                    className="cursor-pointer rounded-md bg-[#ededed] px-3.5 py-2 text-sm font-medium text-black transition hover:bg-white disabled:opacity-50"
                  >
                    {finalizeMutation.isPending ? 'Mengirim...' : 'Ya, Submit Final'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="mt-6 border-t border-edge pt-4">
              {isLeader ? (
                // The contract has no leader exit: POST /api/teams/me/leave answers
                // 409 leader_cannot_leave, so offer no button that can only fail.
                <p data-testid="leader-cannot-leave-notice" className="text-xs text-ink-3">
                  Sebagai ketua, Anda tidak dapat keluar dari tim. Keluarkan anggota lain lebih
                  dahulu bila tim perlu dibubarkan.
                </p>
              ) : pendingConfirm?.kind === 'leave' ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-sm text-ink-2">
                    Keluar dari tim ini? Anda bisa bergabung lagi dengan kode tim.
                  </p>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => leaveMutation.mutate()}
                    className="cursor-pointer rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-950/60 disabled:opacity-50"
                  >
                    Ya, Keluar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingConfirm(null)}
                    className="cursor-pointer rounded-xl border border-edge px-3 py-1.5 text-xs text-ink-2 transition hover:border-sky/70"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPendingConfirm({ kind: 'leave' })}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-red-500/50 hover:text-red-200"
                >
                  <DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Keluar dari Tim
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
