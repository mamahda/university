import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  Minus,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  apiClient,
  type FinalizeMissingItem,
  type VerificationStatus,
} from '@/api'
import {
  computeCountdown,
  formatDeadlineDisplay,
  useLiveNow,
} from '@/lib/countdown'
import { DocumentsSection } from '@/pages/participant/sections/DocumentsSection'
import { TeamSection } from '@/pages/participant/sections/TeamSection'
import { VideoSection } from '@/pages/participant/sections/VideoSection'
import { useAuthStore } from '@/stores/authStore'
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  CARD,
  FOCUS,
  PAGE_TITLE,
  SECTION_HEADING,
  WELL,
} from '@/components/ui/tokens'

/**
 * Dashboard surfaces use two depths only. Cards are *elevated* (`#121212`) and
 * advance toward the reader; inset rows and quick-nav tiles are *recessed*
 * (black) and fall back. Muted text bottoms out at `zinc-400` (7.31:1 on an
 * elevated card, 8.19:1 on a recessed one) — `zinc-500` is 3.88:1 and is never
 * used for text or glyphs.
 *
 * Monospaced, tabular figures mark a value the server computed or verified:
 * the countdown, the policy version, the invite code, readiness counts. Prose
 * stays in the sans face.
 */

const VERIFICATION_BADGE_MAP: Record<
  VerificationStatus,
  { label: string; className: string }
> = {
  belum_lengkap: {
    label: 'Belum Lengkap',
    className: 'border-edge bg-panel text-ink-2',
  },
  menunggu: {
    label: 'Menunggu Verifikasi',
    className: 'border-amber-500/40 bg-amber-950/50 text-amber-200',
  },
  terverifikasi: {
    label: 'Terverifikasi',
    className: 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200',
  },
  ditolak: {
    label: 'Ditolak',
    className: 'border-rose-500/40 bg-rose-950/50 text-rose-200',
  },
}

const FINALIZE_MISSING_LABELS: Record<FinalizeMissingItem, string> = {
  proposal: 'Proposal PDF belum diunggah',
  video: 'Video Demo MP4 belum diunggah',
  repo_url: 'URL Repositori GitHub belum disimpan',
  min_members: 'Jumlah anggota tim belum mencapai batas minimum',
  members_incomplete: 'Masih ada anggota yang belum melengkapi profil/dokumen',
}

interface StatusChipProps {
  label: string
  ready: boolean
}

/**
 * Readiness chip. The state is carried by a glyph and a screen-reader word in
 * addition to color, so it survives color blindness and increased contrast.
 */
function StatusChip({ label, ready }: StatusChipProps) {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-center text-sm ${
        ready
          ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
          : 'border-edge-soft bg-well text-ink-3'
      }`}
    >
      {ready ? (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Minus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{label}</span>
      <span className="sr-only">{ready ? '— sudah ada' : '— belum ada'}</span>
    </div>
  )
}

interface DeadlineRowProps {
  testId: string
  title: string
  subtitle: string
  deadlineIso: string | null
  nowMs: number
}

/** One deadline in the header's timeline: its name, date, state and live clock. */
function DeadlineRow({ testId, title, subtitle, deadlineIso, nowMs }: DeadlineRowProps) {
  const snapshot = deadlineIso ? computeCountdown(deadlineIso, nowMs) : null
  const formattedDate = deadlineIso ? formatDeadlineDisplay(deadlineIso) : 'Belum ditetapkan'

  return (
    <li data-testid={testId} className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink-3">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {subtitle}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-white">{title}</h3>
        </div>

        {snapshot && (
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              snapshot.expired
                ? 'border-rose-500/40 bg-rose-950/50 text-rose-200'
                : 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200'
            }`}
          >
            {snapshot.expired ? 'Tenggat Terlewat' : 'Aktif'}
          </span>
        )}
      </div>

      {snapshot ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-lg font-semibold text-white tabular-nums">
            {[
              [snapshot.days, 'h'],
              [snapshot.hours, 'j'],
              [snapshot.minutes, 'm'],
              [snapshot.seconds, 'd'],
            ]
              .map(([value, unit]) => `${String(value).padStart(2, '0')}${unit}`)
              .join(' ')}
          </p>
          <p className="text-xs text-ink-3">
            Batas akhir: <span className="text-ink-2">{formattedDate}</span>
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-3">Format waktu tenggat tidak valid.</p>
      )}
    </li>
  )
}

export function ParticipantDashboardPage() {
  const user = useAuthStore((state) => state.user)
  const nowMs = useLiveNow(1000)

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => apiClient.public.getSettings(signal),
  })

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => apiClient.profile.get(signal),
  })

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: ({ signal }) => apiClient.documents.list(signal),
  })

  const teamQuery = useQuery({
    queryKey: ['teams', 'me'],
    queryFn: ({ signal }) => apiClient.teams.getMine(signal),
  })

  const isInitialLoading =
    settingsQuery.isLoading ||
    profileQuery.isLoading ||
    documentsQuery.isLoading ||
    teamQuery.isLoading

  // A refetch of already-cached data leaves `isLoading` false, so the refresh
  // button needs `isFetching` to acknowledge the click at all.
  const isRefreshing =
    settingsQuery.isFetching ||
    profileQuery.isFetching ||
    documentsQuery.isFetching ||
    teamQuery.isFetching

  const hasQueryError =
    settingsQuery.isError ||
    profileQuery.isError ||
    documentsQuery.isError ||
    teamQuery.isError

  function handleRetryAll() {
    void settingsQuery.refetch()
    void profileQuery.refetch()
    void documentsQuery.refetch()
    void teamQuery.refetch()
  }

  const profile = profileQuery.data
  const documents = documentsQuery.data
  const team = teamQuery.data?.team ?? null
  const settings = settingsQuery.data

  const verificationStatus: VerificationStatus =
    profile?.verification_status ?? user?.verification_status ?? 'belum_lengkap'
  const verificationBadge = VERIFICATION_BADGE_MAP[verificationStatus]

  const rejectionNote =
    profile?.verification_note ?? user?.verification_note ?? null

  const uploadedDocsCount = [documents?.ktp, documents?.ktm, documents?.twibbon].filter(
    Boolean,
  ).length

  const isTeamLeader = Boolean(team && user && team.leader_id === user.id)
  const readyMembersCount = team
    ? team.members.filter((m) => m.profile_complete && m.documents_complete).length
    : 0

  return (
    <div className="space-y-6">
      {/* The screen opens on its title and the one deadline that governs it,
          flat on the page ground: the portal has no tinted hero band. */}
      <section
        data-testid="dashboard-hero"
        className={`relative overflow-hidden ${CARD} p-6 sm:p-8`}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-xl">
            <h1 className={PAGE_TITLE}>Ruang Peserta</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Selamat datang,{' '}
              <span className="font-semibold text-white">
                {profile?.full_name || user?.full_name || user?.email || 'Peserta'}
              </span>
            </p>

            <button
              type="button"
              onClick={handleRetryAll}
              disabled={isInitialLoading}
              aria-busy={isRefreshing}
              className={`mt-4 ${BTN_SECONDARY}`}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'motion-safe:animate-spin' : ''}`}
                aria-hidden="true"
              />
              Segarkan Status
            </button>
          </div>

        </div>

        {settings && (
          <section
            aria-labelledby="timeline-heading"
            className="mt-6 border-t border-edge-soft pt-5"
          >
            <h2 id="timeline-heading" className={SECTION_HEADING}>
              Timeline
            </h2>
            <ul className="mt-3 divide-y divide-edge-soft">
              <DeadlineRow
                testId="registration-countdown-card"
                subtitle="Pendaftaran & Dokumen"
                title="Tenggat Pendaftaran Peserta"
                deadlineIso={settings.registration_deadline}
                nowMs={nowMs}
              />
              <DeadlineRow
                testId="submission-countdown-card"
                subtitle="Proposal, Video & Finalisasi"
                title="Tenggat Pengumpulan Karya"
                deadlineIso={settings.submission_deadline}
                nowMs={nowMs}
              />
            </ul>
          </section>
        )}
      </section>

      {/* Rejection Reason Alert (ditolak) */}
      {verificationStatus === 'ditolak' && (
        <section
          role="alert"
          data-testid="rejection-alert"
          className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5 text-rose-100"
        >
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="text-base font-semibold text-white">
                Verifikasi Peserta Ditolak — Perlu Perbaikan
              </h2>
              <p className="mt-1.5 text-sm text-rose-200">
                {rejectionNote
                  ? `Catatan Superadmin: "${rejectionNote}"`
                  : 'Panitia menolak dokumen atau data diri Anda. Silakan periksa kembali profil dan unggah ulang dokumen identitas yang jelas.'}
              </p>
              <p className="mt-1.5 text-sm text-rose-200/90">
                Selama tenggat pendaftaran belum terlewat, mengunggah ulang dokumen atau
                memperbaiki profil akan mengembalikan status Anda ke{' '}
                <strong className="font-semibold text-white">Menunggu Verifikasi</strong>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <a href="#documents-section" className={BTN_PRIMARY}>
                  Unggah Ulang Dokumen
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  to="/profile"
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 bg-well/60 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-rose-300 ${FOCUS}`}
                >
                  Periksa Data Diri
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Async Error Banner */}
      {hasQueryError && (
        <section
          role="alert"
          data-testid="dashboard-error-alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/40 px-5 py-4 text-sm text-amber-200"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>Sebagian data dashboard gagal dimuat dari server.</span>
          </div>
          <button
            type="button"
            onClick={handleRetryAll}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/40 bg-well px-3.5 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-950 ${FOCUS}`}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'motion-safe:animate-spin' : ''}`}
              aria-hidden="true"
            />
            Coba Muat Ulang
          </button>
        </section>
      )}

      {/* Initial Loading State */}
      {isInitialLoading && (
        <div
          role="status"
          data-testid="dashboard-loading"
          className={`flex items-center justify-center gap-2.5 ${CARD} p-6 text-sm text-ink-2`}
        >
          <RefreshCw
            className="h-4 w-4 shrink-0 text-ink-3 motion-safe:animate-spin"
            aria-hidden="true"
          />
          Memuat ringkasan pendaftaran, tenggat waktu, dan status tim...
        </div>
      )}

      <section
        data-testid="announcement-card"
        aria-labelledby="announcement-heading"
        className={`${CARD} p-6 text-center`}
      >
        <h2 id="announcement-heading" className="text-lg font-bold text-sky">
          Pengumuman
        </h2>
        <p className="mt-2 text-sm text-ink-2">
          {settings
            ? 'Belum ada pengumuman baru dari panitia.'
            : 'Pengumuman panitia akan tampil di sini.'}
        </p>
      </section>

      <div className="space-y-6">
      {/* Dual Status Cards (Verification + Team) */}
      <section aria-labelledby="readiness-heading" className="space-y-3">
        <h2 id="readiness-heading" className={`px-1 ${SECTION_HEADING}`}>
          Status Verifikasi &amp; Kesiapan Tim
        </h2>

        <div className="grid gap-4">
          {/* Card 1: Participant Verification Status */}
          <article
            data-testid="verification-status-card"
            className={`flex flex-col justify-between ${CARD} p-6`}
          >
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge bg-well text-white">
                    <FileCheck2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Status Verifikasi Peserta
                  </h3>
                </div>

                <span
                  data-testid="verification-status-badge"
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${verificationBadge.className}`}
                >
                  {verificationBadge.label}
                </span>
              </div>

              <ul className="mt-4 space-y-3 text-sm">
                <li className={`flex items-center justify-between gap-3 ${WELL} px-3.5 py-2.5`}>
                  <span className="text-ink-2">Persetujuan Privasi UU PDP</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span className="font-mono tabular-nums">
                      v
                      {user?.consent?.policy_version ??
                        user?.current_policy_version ??
                        '1.0'}
                    </span>
                  </span>
                </li>

                <li className={`flex items-center justify-between gap-3 ${WELL} px-3.5 py-2.5`}>
                  <div className="min-w-0">
                    <p className="text-ink-2">Data Diri Peserta (7 Field)</p>
                    {profile?.institution && (
                      <p className="mt-0.5 text-ink-3">
                        {profile.full_name} · {profile.institution}
                      </p>
                    )}
                  </div>
                  {profile?.profile_complete ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Lengkap
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-amber-300">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      Belum Lengkap
                    </span>
                  )}
                </li>

                <li className={`${WELL} px-3.5 py-3`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-ink-2">Dokumen Identitas Wajib</span>
                    <span className="shrink-0 font-medium text-ink-2 tabular-nums">
                      {uploadedDocsCount}/3 terunggah
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[
                      { key: 'ktp', label: 'Scan KTP', item: documents?.ktp },
                      { key: 'ktm', label: 'KTM / KRSM', item: documents?.ktm },
                      { key: 'twibbon', label: 'Twibbon', item: documents?.twibbon },
                    ].map((doc) => (
                      <StatusChip
                        key={doc.key}
                        label={doc.label}
                        ready={Boolean(doc.item)}
                      />
                    ))}
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5 pt-2">
              {!profile?.profile_complete ? (
                <Link to="/profile" className={BTN_PRIMARY}>
                  Lengkapi Profil
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <a href="#documents-section" className={BTN_PRIMARY}>
                  {documents?.documents_complete ? 'Kelola Dokumen' : 'Unggah Dokumen'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}

              <Link to="/profile" className={BTN_SECONDARY}>
                Buka Profil
              </Link>
            </div>
          </article>

          {/* Card 2: Team & Submission Status */}
          <article
            data-testid="team-status-card"
            className={`flex flex-col justify-between ${CARD} p-6`}
          >
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge bg-well text-white">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Status Tim &amp; Submission
                  </h3>
                </div>

                {!team ? (
                  <span
                    data-testid="team-status-badge"
                    className="rounded-full border border-edge bg-panel px-3 py-1 text-xs font-semibold text-ink-2"
                  >
                    Belum Bertim
                  </span>
                ) : team.status === 'final' ? (
                  <span
                    data-testid="team-status-badge"
                    className="rounded-full border border-emerald-500/40 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-200"
                  >
                    Final (Terkunci)
                  </span>
                ) : (
                  <span
                    data-testid="team-status-badge"
                    className="rounded-full border border-sky/40 bg-sky/10 px-3 py-1 text-xs font-semibold text-sky"
                  >
                    Draft
                  </span>
                )}
              </div>

              {!team ? (
                <div className={`mt-4 ${WELL} p-4 text-sm text-ink-2`}>
                  <p className="font-medium text-white">Anda belum tergabung dalam tim mana pun.</p>
                  <p className="mt-1 leading-relaxed text-ink-3">
                    Buat tim baru untuk menjadi Ketua Tim dan memperoleh kode undangan 8 karakter,
                    atau gabung ke tim rekan Anda menggunakan kode tim yang sudah ada.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm">
                  <div
                    className={`flex flex-wrap items-center justify-between gap-2 ${WELL} px-3.5 py-2.5`}
                  >
                    <div>
                      <p className="font-semibold text-white">{team.name}</p>
                      <p className="mt-0.5 text-ink-3">
                        Peran: {isTeamLeader ? 'Ketua Tim' : 'Anggota'} · Kode:{' '}
                        <code className="rounded bg-field px-1.5 py-0.5 font-mono tracking-wider text-ink-2">
                          {team.code}
                        </code>
                      </p>
                    </div>
                    <span className="font-medium text-ink-2 tabular-nums">
                      {readyMembersCount}/{team.members.length} anggota lengkap
                    </span>
                  </div>

                  <div className={`${WELL} px-3.5 py-3`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-ink-2">Komponen Karya Hackathon</span>
                      <span className="shrink-0 text-ink-3">
                        {team.status === 'final' ? 'Terkunci untuk penjurian' : 'Dapat diperbarui'}
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[
                        {
                          key: 'proposal',
                          label: 'Proposal PDF',
                          ready: Boolean(team.submission.proposal),
                        },
                        {
                          key: 'video',
                          label: 'Video MP4',
                          ready: Boolean(team.submission.video),
                        },
                        {
                          key: 'repo',
                          label: 'Repo GitHub',
                          ready: Boolean(team.submission.repo_url),
                        },
                      ].map((artifact) => (
                        <StatusChip
                          key={artifact.key}
                          label={artifact.label}
                          ready={artifact.ready}
                        />
                      ))}
                    </div>
                  </div>

                  {team.status === 'draft' && team.finalize_missing.length > 0 && (
                    <div
                      data-testid="finalize-missing-list"
                      className="rounded-xl border border-edge bg-well/70 px-3.5 py-3 text-ink-3"
                    >
                      <p className="font-medium text-ink-2">Syarat menuju Submit Final:</p>
                      <ul className="mt-1.5 space-y-1">
                        {team.finalize_missing.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Minus
                              className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-300"
                              aria-hidden="true"
                            />
                            <span>{FINALIZE_MISSING_LABELS[item]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5 pt-2">
              <a href="#team-section" className={BTN_PRIMARY}>
                {!team ? 'Buat atau Gabung Tim' : 'Kelola Tim & Karya'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>

              {team && (
                <a href="#video-section" className={BTN_SECONDARY}>
                  Video Demo
                </a>
              )}
            </div>
          </article>
        </div>
      </section>

          <div id="team-section" data-testid="team-section" className="scroll-mt-24">
            <TeamSection />
          </div>

          <div id="documents-section" data-testid="documents-section" className="scroll-mt-24">
            <DocumentsSection />
          </div>

          <div id="video-section" data-testid="video-section" className="scroll-mt-24">
            <VideoSection />
          </div>
      </div>
    </div>
  )
}
