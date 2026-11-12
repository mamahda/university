import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  FileImage,
  FileText,
  Lock,
  RefreshCw,
  ShieldAlert,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  apiClient,
  isApiClientError,
  type DocumentType,
  type ItemMeta,
  type UploadProgress,
  type VerificationStatus,
} from '@/api'
import { formatDeadlineDisplay, useLiveNow } from '@/lib/countdown'
import { formatBytes, validateDocumentFile } from '@/lib/fileValidation'
import {
  SHEET,
  SHEET_ACTION,
  SHEET_ACTION_PRIMARY,
  SHEET_LABEL,
  SHEET_MUTED,
  SHEET_TITLE,
} from '@/components/ui/tokens'
import { useAuthStore } from '@/stores/authStore'

interface DocumentSlotConfig {
  type: DocumentType
  title: string
  subtitle: string
  privacyNote: string
}

const DOCUMENT_SLOTS: readonly DocumentSlotConfig[] = [
  {
    type: 'ktp',
    title: 'Scan KTP',
    subtitle: 'Kartu Tanda Penduduk resmi peserta',
    privacyNote: 'Memuat data sensitif (NIK/agama); hanya dapat dibuka oleh Anda & Superadmin.',
  },
  {
    type: 'ktm',
    title: 'Scan KTM / KRSM',
    subtitle: 'Kartu Tanda Mahasiswa atau KRSM semester berjalan',
    privacyNote: 'Bukti wajib status mahasiswa aktif perguruan tinggi.',
  },
  {
    type: 'twibbon',
    title: 'Bukti Unggah Twibbon',
    subtitle: 'Tangkapan layar atau PDF bukti publikasi Twibbon Schematics NIC',
    privacyNote: 'Syarat administrasi pendaftaran kompetisi.',
  },
] as const

/** On the white sheet a status is a pale tint under dark text of its own hue. */
const VERIFICATION_BADGE_STYLES: Record<
  VerificationStatus,
  { label: string; sheetClassName: string }
> = {
  belum_lengkap: {
    label: 'Belum Lengkap',
    sheetClassName: 'border border-edge bg-well text-ink-2',
  },
  menunggu: {
    label: 'Menunggu Verifikasi',
    sheetClassName: 'bg-amber-950/50 text-amber-200',
  },
  terverifikasi: {
    label: 'Terverifikasi',
    sheetClassName: 'bg-emerald-950/50 text-emerald-200',
  },
  ditolak: {
    label: 'Ditolak',
    sheetClassName: 'bg-rose-950/50 text-rose-200',
  },
}

interface SlotUploadState {
  isUploading: boolean
  progress: UploadProgress | null
  errorMessage: string | null
  successMessage: string | null
}

const INITIAL_SLOT_STATE: SlotUploadState = {
  isUploading: false,
  progress: null,
  errorMessage: null,
  successMessage: null,
}

interface PreviewModalState {
  slotTitle: string
  item: ItemMeta
  isLoading: boolean
  objectUrl: string | null
  contentType: string
  errorMessage: string | null
  isIntegrityError: boolean
}

function formatUploadedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function DocumentsSection() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: ({ signal }) => apiClient.documents.list(signal),
  })

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => apiClient.profile.get(signal),
  })

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => apiClient.public.getSettings(signal),
  })

  const [slotStates, setSlotStates] = useState<Record<DocumentType, SlotUploadState>>({
    ktp: { ...INITIAL_SLOT_STATE },
    ktm: { ...INITIAL_SLOT_STATE },
    twibbon: { ...INITIAL_SLOT_STATE },
  })
  const [downloadingType, setDownloadingType] = useState<DocumentType | null>(null)
  const [previewModal, setPreviewModal] = useState<PreviewModalState | null>(null)

  const abortControllersRef = useRef<Partial<Record<DocumentType, AbortController>>>({})
  const fileInputRefs = useRef<Partial<Record<DocumentType, HTMLInputElement | null>>>({})
  const activeObjectUrlRef = useRef<string | null>(null)
  const previewAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controllers = abortControllersRef.current
    return () => {
      for (const controller of Object.values(controllers)) {
        controller?.abort()
      }
      previewAbortRef.current?.abort()
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current)
        activeObjectUrlRef.current = null
      }
    }
  }, [])

  function revokeActivePreviewUrl() {
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current)
      activeObjectUrlRef.current = null
    }
  }

  function closePreviewModal() {
    previewAbortRef.current?.abort()
    previewAbortRef.current = null
    revokeActivePreviewUrl()
    setPreviewModal(null)
  }

  function updateSlotState(type: DocumentType, patch: Partial<SlotUploadState>) {
    setSlotStates((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...patch,
      },
    }))
  }

  const nowMs = useLiveNow(60_000)
  const maxDocBytes = settingsQuery.data?.limits.document_max_bytes ?? 5_242_880
  const registrationDeadline = settingsQuery.data?.registration_deadline ?? null
  const deadlinePassed =
    registrationDeadline !== null &&
    !Number.isNaN(Date.parse(registrationDeadline)) &&
    nowMs > Date.parse(registrationDeadline)

  async function handleFileSelected(type: DocumentType, event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''
    if (!selectedFile) {
      return
    }

    updateSlotState(type, {
      errorMessage: null,
      successMessage: null,
      progress: null,
    })

    const validation = await validateDocumentFile(selectedFile, maxDocBytes)
    if (!validation.valid) {
      updateSlotState(type, {
        isUploading: false,
        progress: null,
        errorMessage: validation.errorMessage,
      })
      return
    }

    abortControllersRef.current[type]?.abort()
    const controller = new AbortController()
    abortControllersRef.current[type] = controller

    updateSlotState(type, {
      isUploading: true,
      progress: {
        loaded: 0,
        total: selectedFile.size,
        fraction: 0,
        percent: 0,
      },
      errorMessage: null,
      successMessage: null,
    })

    try {
      const uploaded = await apiClient.documents.upload(type, selectedFile, {
        filename: selectedFile.name,
        signal: controller.signal,
        onProgress: (progress) => {
          updateSlotState(type, { progress })
        },
      })

      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        useAuthStore.getState().setSessionUser({
          ...currentUser,
          verification_status: uploaded.verification_status,
          verification_note:
            uploaded.verification_status === 'menunggu'
              ? null
              : (currentUser.verification_note ?? null),
        })
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['documents'] }),
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({ queryKey: ['teams', 'me'] }),
      ])

      updateSlotState(type, {
        isUploading: false,
        progress: null,
        errorMessage: null,
        successMessage: `Berhasil mengunggah & mengenkripsi "${uploaded.original_filename}" (AES-CTR, DES-CTR, RC4).`,
      })
    } catch (err) {
      if (isApiClientError(err) && err.code === 'aborted') {
        updateSlotState(type, {
          isUploading: false,
          progress: null,
          errorMessage: 'Unggahan dokumen dibatalkan.',
        })
        return
      }

      updateSlotState(type, {
        isUploading: false,
        progress: null,
        errorMessage: isApiClientError(err)
          ? err.message
          : 'Gagal mengunggah dokumen ke server.',
      })
    } finally {
      delete abortControllersRef.current[type]
    }
  }

  function handleCancelUpload(type: DocumentType) {
    abortControllersRef.current[type]?.abort()
  }

  async function handleOpenPreview(slotTitle: string, item: ItemMeta) {
    previewAbortRef.current?.abort()
    revokeActivePreviewUrl()

    const controller = new AbortController()
    previewAbortRef.current = controller

    setPreviewModal({
      slotTitle,
      item,
      isLoading: true,
      objectUrl: null,
      contentType: item.content_type,
      errorMessage: null,
      isIntegrityError: false,
    })

    try {
      const fetched = await apiClient.items.getBlob(item.item_id, {
        download: false,
        signal: controller.signal,
      })

      if (controller.signal.aborted) {
        return
      }

      const typedBlob =
        fetched.blob.type === fetched.content_type
          ? fetched.blob
          : new Blob([fetched.blob], { type: fetched.content_type })
      const objectUrl = URL.createObjectURL(typedBlob)
      activeObjectUrlRef.current = objectUrl

      setPreviewModal({
        slotTitle,
        item,
        isLoading: false,
        objectUrl,
        contentType: fetched.content_type || item.content_type,
        errorMessage: null,
        isIntegrityError: false,
      })
    } catch (err) {
      if (isApiClientError(err) && err.code === 'aborted') {
        return
      }

      setPreviewModal({
        slotTitle,
        item,
        isLoading: false,
        objectUrl: null,
        contentType: item.content_type,
        errorMessage: isApiClientError(err)
          ? err.message
          : 'Gagal memuat pratinjau dokumen terenkripsi.',
        isIntegrityError: isApiClientError(err) && err.isIntegrityError(),
      })
    }
  }

  async function handleDownloadDocument(type: DocumentType, item: ItemMeta) {
    setDownloadingType(type)
    updateSlotState(type, { errorMessage: null })

    try {
      const fetched = await apiClient.items.getBlob(item.item_id, {
        download: true,
      })

      const downloadUrl = URL.createObjectURL(fetched.blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = fetched.filename || item.original_filename
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      window.setTimeout(() => {
        URL.revokeObjectURL(downloadUrl)
      }, 0)
    } catch (err) {
      updateSlotState(type, {
        errorMessage: isApiClientError(err)
          ? err.message
          : 'Gagal mengunduh file dari server.',
      })
    } finally {
      setDownloadingType(null)
    }
  }

  const documents = documentsQuery.data
  const profile = profileQuery.data
  const verificationStatus: VerificationStatus =
    profile?.verification_status ?? user?.verification_status ?? 'belum_lengkap'
  const statusBadge = VERIFICATION_BADGE_STYLES[verificationStatus]

  const uploadedCount = [documents?.ktp, documents?.ktm, documents?.twibbon].filter(
    Boolean,
  ).length

  return (
    <div className="space-y-6">
      {/* Profile Incomplete Reminder */}
      {profile && !profile.profile_complete && (
        <section
          data-testid="profile-incomplete-reminder"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/35 bg-amber-950/30 px-5 py-4 text-xs text-amber-200"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>
              Status verifikasi baru berubah ke <strong className="text-white">Menunggu Verifikasi</strong>{' '}
              setelah ketujuh data diri di halaman Profil dan ketiga dokumen di bawah lengkap.
            </span>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-well px-3 py-1.5 text-xs font-semibold text-white transition hover:border-amber-300"
          >
            Lengkapi Profil
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      )}

      {/* Deadline Passed Warning */}
      {deadlinePassed && (
        <section
          role="alert"
          data-testid="documents-deadline-alert"
          className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-950/35 px-5 py-4 text-xs text-rose-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
          <span>
            Tenggat pendaftaran ({formatDeadlineDisplay(registrationDeadline!)}) telah lewat.
            Unggahan baru atau penggantian dokumen akan ditolak oleh server (`409 deadline_passed`).
          </span>
        </section>
      )}

      {/* Loading & Error States */}
      {documentsQuery.isLoading && (
        <div
          role="status"
          data-testid="documents-loading"
          className="rounded-2xl border border-edge bg-panel p-6 text-center text-sm text-ink-3"
        >
          Memuat status ketiga dokumen identitas...
        </div>
      )}

      {documentsQuery.isError && (
        <section
          role="alert"
          data-testid="documents-load-error"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-5 py-4 text-sm text-rose-200"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>
              {isApiClientError(documentsQuery.error)
                ? documentsQuery.error.message
                : 'Gagal memuat daftar dokumen peserta.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void documentsQuery.refetch()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-400/40 bg-well px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-950"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Muat Ulang
          </button>
        </section>
      )}

      {/* The portal's DOKUMEN sheet: a white card over the space ground with
          one stacked row per document — a label, the file it holds, and its
          actions on one full-width line. Measured from the Schematics 2026
          Figma, node 1149:10712. */}
      {documents && (
        <section data-testid="documents-sheet" className={`${SHEET} px-6 py-7 sm:px-10 sm:py-8`}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h3 className={SHEET_TITLE}>DOKUMEN</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="documents-progress-pill"
                className="rounded-full border border-edge bg-well px-3 py-1 text-xs font-medium text-ink-2"
              >
                {uploadedCount}/3 dokumen terunggah
              </span>
              <span
                data-testid="documents-verification-badge"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.sheetClassName}`}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>

          <p className={`mt-1 ${SHEET_MUTED}`}>
            JPG, PNG, atau PDF · maks {formatBytes(maxDocBytes)}
          </p>

          <div className="mt-6 flex flex-col gap-7">
            {DOCUMENT_SLOTS.map((slot) => {
              const item = documents[slot.type]
              const state = slotStates[slot.type]
              const isPdf = item?.content_type === 'application/pdf'
              const percent = state.progress?.percent ?? 0

              return (
                <article key={slot.type} data-testid={`document-card-${slot.type}`}>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <div className="flex items-center gap-2">
                      {item ? (
                        isPdf ? (
                          <FileText className="h-4 w-4 shrink-0 text-ink" aria-hidden="true" />
                        ) : (
                          <FileImage className="h-4 w-4 shrink-0 text-ink" aria-hidden="true" />
                        )
                      ) : (
                        <FileCheck2
                          className="h-4 w-4 shrink-0 text-ink-3"
                          aria-hidden="true"
                        />
                      )}
                      <h4 className={SHEET_LABEL}>{slot.title}</h4>
                    </div>

                    {item ? (
                      <span className="rounded-full bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
                        Terunggah
                      </span>
                    ) : (
                      <span className="rounded-full border border-edge bg-well px-2.5 py-0.5 text-xs font-medium text-ink-2">
                        Kosong
                      </span>
                    )}
                  </div>

                  {/* What this slot holds, on one line under its label. */}
                  {item ? (
                    <p className={`mt-1 ${SHEET_MUTED}`}>
                      <span className="font-medium text-ink" title={item.original_filename}>
                        {item.original_filename}
                      </span>{' '}
                      · {item.content_type} · {formatBytes(item.size_bytes)} ·{' '}
                      {formatUploadedAt(item.uploaded_at)} ·{' '}
                      <span className="font-mono text-xs">{item.item_id.slice(0, 8)}…</span>
                    </p>
                  ) : (
                    <p className={`mt-1 ${SHEET_MUTED}`}>
                      Belum ada dokumen terunggah. {slot.privacyNote}
                    </p>
                  )}

                  {/* Active XHR Upload Progress Bar */}
                  {state.isUploading && (
                    <div
                      data-testid={`doc-progress-box-${slot.type}`}
                      className="mt-3 rounded-[14.52px] border border-edge p-3.5"
                    >
                      <div className="flex items-center justify-between text-xs text-ink-2">
                        <span className="font-medium text-ink">
                          Mengenkripsi &amp; mengunggah stream...
                        </span>
                        <span className="tabular-nums">
                          {state.progress?.percent !== null && state.progress?.percent !== undefined
                            ? `${state.progress.percent}%`
                            : 'Memproses...'}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Progress unggah ${slot.title}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                        data-testid={`doc-progressbar-${slot.type}`}
                        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-edge-soft"
                      >
                        <div
                          className="h-full rounded-full bg-night transition-[width] duration-150"
                          style={{ width: `${Math.max(4, percent)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-2">
                        <span>
                          {state.progress
                            ? `${formatBytes(state.progress.loaded)} / ${formatBytes(state.progress.total)}`
                            : 'Mengirim body mentah...'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCancelUpload(slot.type)}
                          className="cursor-pointer font-semibold text-rose-300 hover:underline"
                        >
                          Batalkan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Per-Card Validation / Upload / Download Error */}
                  {state.errorMessage && (
                    <div
                      role="alert"
                      data-testid={`doc-error-${slot.type}`}
                      className="mt-3 flex items-start gap-2 rounded-[14.52px] bg-rose-950/50 p-3 text-xs text-rose-200"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{state.errorMessage}</span>
                    </div>
                  )}

                  {/* Per-Card Upload Success */}
                  {state.successMessage && (
                    <div
                      role="status"
                      data-testid={`doc-success-${slot.type}`}
                      className="mt-3 flex items-start gap-2 rounded-[14.52px] bg-emerald-950/50 p-3 text-xs text-emerald-200"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{state.successMessage}</span>
                    </div>
                  )}

                  {/* The row's actions, on one full-width line. */}
                  <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[slot.type] = el
                      }}
                      id={`file-input-${slot.type}`}
                      data-testid={`file-input-${slot.type}`}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      onChange={(e) => void handleFileSelected(slot.type, e)}
                      disabled={state.isUploading}
                      className="sr-only"
                    />

                    {item ? (
                      <>
                        <button
                          type="button"
                          data-testid={`doc-preview-btn-${slot.type}`}
                          onClick={() => void handleOpenPreview(slot.title, item)}
                          disabled={state.isUploading}
                          className={SHEET_ACTION}
                        >
                          <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                          Pratinjau
                        </button>

                        <button
                          type="button"
                          data-testid={`doc-download-btn-${slot.type}`}
                          onClick={() => void handleDownloadDocument(slot.type, item)}
                          disabled={state.isUploading || downloadingType === slot.type}
                          className={SHEET_ACTION}
                        >
                          <Download className="h-[18px] w-[18px]" aria-hidden="true" />
                          {downloadingType === slot.type ? 'Mengunduh...' : 'Unduh'}
                        </button>

                        <button
                          type="button"
                          data-testid={`doc-replace-btn-${slot.type}`}
                          onClick={() => fileInputRefs.current[slot.type]?.click()}
                          disabled={state.isUploading}
                          className={`${SHEET_ACTION_PRIMARY} w-full sm:w-auto sm:shrink-0`}
                        >
                          <Upload className="h-[18px] w-[18px]" aria-hidden="true" />
                          Ganti Dokumen
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        data-testid={`doc-upload-btn-${slot.type}`}
                        onClick={() => fileInputRefs.current[slot.type]?.click()}
                        disabled={state.isUploading}
                        className={SHEET_ACTION}
                      >
                        <Upload className="h-[18px] w-[18px]" aria-hidden="true" />
                        Pilih &amp; Unggah File
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {/* Security & Replace Semantics Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edge bg-panel px-5 py-4 text-xs text-ink-3">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-ink-2" aria-hidden="true" />
          <span>
            Mengunggah ulang akan menggantikan file lama dengan kunci &amp; nonce baru. Saat dibuka,
            server memverifikasi HMAC dan kesamaan ketiga dekripsi penuh sebelum mengirim blob.
          </span>
        </div>
        <a
          href="#team-section"
          className="inline-flex items-center gap-1 font-medium text-ink-2 transition hover:text-white"
        >
          Lanjut ke Team Workspace
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </footer>

      {/* Inline Blob Preview Modal */}
      {previewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="doc-preview-modal-title"
          data-testid="document-preview-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1424]/95 p-4"
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-edge bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.95)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-5 py-4">
              <div>
                <h2 id="doc-preview-modal-title" className="text-sm font-semibold text-white">
                  Pratinjau {previewModal.slotTitle} — {previewModal.item.original_filename}
                </h2>
                <p className="text-xs text-ink-3">
                  Terverifikasi penuh dari 3 ciphertext (AES-CTR, DES-CTR, RC4 + HMAC-SHA256) ·{' '}
                  {formatBytes(previewModal.item.size_bytes)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void handleDownloadDocument(
                      previewModal.item.field as DocumentType,
                      previewModal.item,
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge bg-well px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-sky/70 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Unduh (?download=1)
                </button>
                <button
                  type="button"
                  aria-label="Tutup pratinjau"
                  onClick={closePreviewModal}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-edge bg-well p-1.5 text-ink-3 transition hover:border-sky/70 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-well p-5">
              {previewModal.isLoading && (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-sm text-ink-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-ink-2" aria-hidden="true" />
                  <p className="mt-3">
                    Memverifikasi HMAC ketiga ciphertext dan mengunduh blob utuh...
                  </p>
                </div>
              )}

              {previewModal.errorMessage && (
                <div
                  role="alert"
                  data-testid="document-preview-error"
                  className="mx-auto my-10 max-w-lg rounded-2xl border border-rose-500/40 bg-rose-950/35 p-5 text-rose-100"
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert
                      className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {previewModal.isIntegrityError
                          ? 'Kegagalan Integritas Kriptografi (500 integrity_error)'
                          : 'Gagal Membuka Dokumen'}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-rose-200">
                        {previewModal.errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!previewModal.isLoading && !previewModal.errorMessage && previewModal.objectUrl && (
                <div className="flex min-h-[360px] items-center justify-center">
                  {previewModal.contentType === 'application/pdf' ? (
                    <iframe
                      data-testid="preview-pdf-iframe"
                      title={`Pratinjau PDF ${previewModal.item.original_filename}`}
                      src={previewModal.objectUrl}
                      className="h-[68vh] w-full rounded-xl border border-edge bg-ground"
                    />
                  ) : (
                    <img
                      data-testid="preview-image"
                      src={previewModal.objectUrl}
                      alt={`Pratinjau ${previewModal.item.original_filename}`}
                      className="max-h-[68vh] max-w-full rounded-xl border border-edge object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
