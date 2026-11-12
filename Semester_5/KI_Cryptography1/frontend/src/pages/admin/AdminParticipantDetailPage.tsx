import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, BadgeAlert, Check, CheckCircle2, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  apiClient,
  isApiClientError,
  type AdminParticipantDetailResponse,
  type VerifyParticipantRequest,
} from '@/api'
import { ItemBlobViewer } from '@/components/ui/ItemBlobViewer'
import {
  BTN_DANGER,
  BTN_PRIMARY,
  CARD,
  FOCUS,
  INPUT,
  LABEL,
  PAGE_TITLE,
  RECESSED,
  SECTION_HEADING,
  WELL,
} from '@/components/ui/tokens'
import { VerificationStatusChip } from '@/components/ui/VerificationStatusChip'

function ProfileField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className={`${RECESSED} px-3 py-2`}>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-sm break-words text-ink-2">{value ?? '—'}</dd>
    </div>
  )
}

export function AdminParticipantDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const queryClient = useQueryClient()

  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const detailQuery = useQuery({
    queryKey: ['admin', 'participants', userId],
    queryFn: ({ signal }) => apiClient.admin.getParticipantDetail(userId as string, signal),
    enabled: Boolean(userId),
  })

  const verifyMutation = useMutation({
    mutationFn: (body: VerifyParticipantRequest) =>
      apiClient.admin.verifyParticipant(userId as string, body),
    onSuccess: (result) => {
      queryClient.setQueryData<AdminParticipantDetailResponse>(
        ['admin', 'participants', userId],
        (previous) =>
          previous
            ? {
                ...previous,
                verification_status: result.verification_status,
                verification_note: result.verification_note,
                profile: {
                  ...previous.profile,
                  verification_status: result.verification_status,
                  verification_note: result.verification_note,
                },
              }
            : previous,
      )
      // The queue shows the same status, so it must not keep the stale one.
      void queryClient.invalidateQueries({ queryKey: ['admin', 'participants'] })

      setNote('')
      setSuccessMessage(
        result.verification_status === 'terverifikasi'
          ? 'Peserta ditandai terverifikasi.'
          : 'Peserta ditandai ditolak.',
      )
    },
  })

  const detail = detailQuery.data

  function handleApprove() {
    setNoteError(null)
    setSuccessMessage(null)
    const trimmed = note.trim()
    verifyMutation.mutate({
      verification_status: 'terverifikasi',
      ...(trimmed.length > 0 ? { note: trimmed } : {}),
    })
  }

  function handleReject() {
    setSuccessMessage(null)
    const trimmed = note.trim()
    if (trimmed.length === 0) {
      // The contract makes `note` mandatory on rejection; stop before the request.
      setNoteError('Catatan wajib diisi saat menolak peserta.')
      return
    }
    setNoteError(null)
    verifyMutation.mutate({ verification_status: 'ditolak', note: trimmed })
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/participants"
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 transition hover:text-white ${FOCUS}`}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke antrean verifikasi
      </Link>

      {detailQuery.isPending ? (
        <p data-testid="participant-detail-loading" className={`${CARD} p-6 text-sm text-ink-3`}>
          Memuat profil peserta...
        </p>
      ) : null}

      {detailQuery.isError ? (
        <p
          data-testid="participant-detail-error"
          role="alert"
          className={`${CARD} flex items-start gap-2 p-6 text-sm text-red-200`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {isApiClientError(detailQuery.error) && detailQuery.error.status === 404
              ? 'Peserta tidak ditemukan.'
              : isApiClientError(detailQuery.error)
                ? detailQuery.error.message
                : 'Gagal memuat profil peserta.'}
          </span>
        </p>
      ) : null}

      {detail ? (
        <div data-testid="participant-detail" className="space-y-6">
          <header>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className={PAGE_TITLE}>
                  {detail.profile.full_name ?? '(nama belum diisi)'}
                </h1>
                <p className="mt-1 text-sm break-all text-ink-3">{detail.email}</p>
              </div>
              <VerificationStatusChip
                status={detail.verification_status}
                testId="verification-status"
              />
            </div>

            {detail.profile.is_minor ? (
              <p
                data-testid="is-minor-badge"
                className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2.5 text-sm text-amber-200"
              >
                <BadgeAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Peserta di bawah umur ({detail.profile.age ?? '?'} tahun). Pemrosesan datanya
                  memerlukan persetujuan orang tua atau wali sesuai UU PDP.
                </span>
              </p>
            ) : null}

            {detail.verification_note ? (
              <p
                data-testid="existing-note"
                className={`mt-3 ${WELL} px-3 py-2.5 text-sm text-ink-2`}
              >
                <span className="block text-xs text-ink-3">Catatan panitia tersimpan</span>
                {detail.verification_note}
              </p>
            ) : null}
          </header>

          <section className={`${CARD} p-6`} aria-labelledby="profile-heading">
            <h2 id="profile-heading" className={SECTION_HEADING}>
              Profil peserta
            </h2>
            <dl
              data-testid="participant-profile"
              className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              <ProfileField label="Nama lengkap" value={detail.profile.full_name} />
              <ProfileField label="NIM" value={detail.profile.nim} />
              <ProfileField label="Program studi" value={detail.profile.study_program} />
              <ProfileField label="Institusi" value={detail.profile.institution} />
              <ProfileField
                label="Tanggal lahir"
                value={
                  detail.profile.birth_date
                    ? `${detail.profile.birth_date} (${detail.profile.age ?? '?'} tahun)`
                    : null
                }
              />
              <ProfileField label="Domisili" value={detail.profile.domicile} />
              <ProfileField label="Nomor telepon" value={detail.profile.phone} />
              <ProfileField
                label="Tim"
                value={detail.team ? `${detail.team.name} (${detail.team.status})` : null}
              />
            </dl>
          </section>

          <section className={`${CARD} p-6`} aria-labelledby="documents-heading">
            <h2 id="documents-heading" className={SECTION_HEADING}>
              Dokumen identitas
            </h2>
            <div data-testid="participant-documents" className="mt-3 space-y-4">
              <ItemBlobViewer field="ktp" label="Scan KTP" item={detail.documents.ktp} />
              <ItemBlobViewer field="ktm" label="KTM / KRSM" item={detail.documents.ktm} />
              <ItemBlobViewer field="twibbon" label="Twibbon" item={detail.documents.twibbon} />
            </div>
          </section>

          <section className={`${CARD} p-6`} aria-labelledby="decision-heading">
            <h2 id="decision-heading" className={SECTION_HEADING}>
              Keputusan verifikasi
            </h2>

            <div className="mt-3">
              <label htmlFor="note-input" className={LABEL}>
                Catatan panitia
                <span className="ml-1 font-normal text-ink-3">
                  (wajib saat menolak, opsional saat menyetujui)
                </span>
              </label>
              <textarea
                id="note-input"
                data-testid="note-input"
                value={note}
                onChange={(event) => {
                  setNote(event.target.value)
                  setNoteError(null)
                }}
                rows={3}
                placeholder="Contoh: Scan KTM tidak terbaca, mohon unggah ulang."
                aria-invalid={noteError ? true : undefined}
                aria-describedby={noteError ? 'note-error' : undefined}
                className={`mt-1 ${INPUT}`}
              />
              {noteError ? (
                <p
                  id="note-error"
                  data-testid="note-error"
                  role="alert"
                  className="mt-1.5 flex items-start gap-1.5 text-sm text-red-300"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {noteError}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="approve-btn"
                onClick={handleApprove}
                disabled={verifyMutation.isPending}
                className={BTN_PRIMARY}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                {verifyMutation.isPending ? 'Menyimpan...' : 'Setujui peserta'}
              </button>
              <button
                type="button"
                data-testid="reject-btn"
                onClick={handleReject}
                disabled={verifyMutation.isPending}
                className={BTN_DANGER}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Tolak peserta
              </button>
            </div>

            {successMessage ? (
              <p
                data-testid="verify-success"
                role="status"
                className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-2.5 text-sm text-emerald-200"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {successMessage}
              </p>
            ) : null}

            {verifyMutation.isError ? (
              <p
                data-testid="verify-error"
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {isApiClientError(verifyMutation.error)
                    ? verifyMutation.error.message
                    : 'Gagal menyimpan keputusan verifikasi.'}
                </span>
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  )
}
