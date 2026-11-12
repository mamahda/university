import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Lock,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  apiClient,
  isApiClientError,
  type ParticipantProfile,
  type UpdateProfileRequest,
  type VerificationStatus,
} from '@/api'
import { useLiveNow } from '@/lib/countdown'
import {
  computeAgeFromBirthDate,
  getChangedReverifyFields,
  getLocalTodayIso,
  normalizeProfileInput,
  PROFILE_FIELD_LABELS,
  validateProfileForm,
  type ProfileFieldErrors,
  type ProfileFieldName,
  type ReverifySensitiveField,
} from '@/lib/profileValidation'
import { useAuthStore } from '@/stores/authStore'
import { PAGE_TITLE } from '@/components/ui/tokens'

const VERIFICATION_BADGE_STYLES: Record<
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

function profileToFormValues(profile: ParticipantProfile): UpdateProfileRequest {
  return {
    full_name: profile.full_name ?? '',
    nim: profile.nim ?? '',
    study_program: profile.study_program ?? '',
    institution: profile.institution ?? '',
    birth_date: profile.birth_date ?? '',
    domicile: profile.domicile ?? '',
    phone: profile.phone ?? '',
  }
}

interface ProfileFormCardProps {
  profile: ParticipantProfile
  registrationDeadlineIso: string | null
}

function ProfileFormCard({ profile, registrationDeadlineIso }: ProfileFormCardProps) {
  const queryClient = useQueryClient()
  const [formValues, setFormValues] = useState<UpdateProfileRequest>(() =>
    profileToFormValues(profile),
  )
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)
  const [pendingReverifyFields, setPendingReverifyFields] = useState<
    ReverifySensitiveField[] | null
  >(null)

  const nowMs = useLiveNow(60_000)
  const nowDate = new Date(nowMs)
  const todayIso = getLocalTodayIso(nowDate)
  const deadlinePassed =
    registrationDeadlineIso !== null &&
    !Number.isNaN(Date.parse(registrationDeadlineIso)) &&
    nowMs > Date.parse(registrationDeadlineIso)

  const previewAge = computeAgeFromBirthDate(formValues.birth_date, nowDate)
  const isMinorPreview = previewAge !== null ? previewAge < 18 : profile.is_minor === true

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) => apiClient.profile.update(payload),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile)
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        useAuthStore.getState().setSessionUser({
          ...currentUser,
          full_name: updatedProfile.full_name,
          verification_status: updatedProfile.verification_status,
          verification_note: updatedProfile.verification_note ?? null,
        })
      }
      void queryClient.invalidateQueries({ queryKey: ['me'] })
      void queryClient.invalidateQueries({ queryKey: ['teams', 'me'] })

      setFormValues(profileToFormValues(updatedProfile))
      setFieldErrors({})
      setServerError(null)
      setPendingReverifyFields(null)
      setSaveSuccessMessage(
        updatedProfile.verification_status === 'menunggu' &&
          profile.verification_status === 'terverifikasi'
          ? 'Profil berhasil diperbarui dengan kunci enkripsi baru. Status verifikasi Anda dikembalikan ke Menunggu Verifikasi.'
          : 'Data diri berhasil dienkripsi ulang (AES-CTR, DES-CTR, RC4) dan disimpan.',
      )
    },
    onError: (err) => {
      setPendingReverifyFields(null)
      if (isApiClientError(err)) {
        if (err.code === 'validation_error') {
          const apiFields: ProfileFieldErrors = {}
          for (const [key, msg] of Object.entries(err.fieldErrors)) {
            if (key in PROFILE_FIELD_LABELS && typeof msg === 'string') {
              apiFields[key as ProfileFieldName] = msg
            }
          }
          setFieldErrors(apiFields)
        }
        setServerError(err.message)
      } else {
        setServerError('Terjadi kesalahan tak terduga saat menyimpan profil.')
      }
    },
  })

  function handleFieldChange(field: ProfileFieldName, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (saveSuccessMessage) {
      setSaveSuccessMessage(null)
    }
    if (serverError) {
      setServerError(null)
    }
  }

  function handleResetToSaved() {
    setFormValues(profileToFormValues(profile))
    setFieldErrors({})
    setServerError(null)
    setSaveSuccessMessage(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setServerError(null)
    setSaveSuccessMessage(null)

    const validationErrors = validateProfileForm(formValues)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }

    const normalized = normalizeProfileInput(formValues)

    if (profile.verification_status === 'terverifikasi') {
      const changedSensitive = getChangedReverifyFields(profile, normalized)
      if (changedSensitive.length > 0) {
        setPendingReverifyFields(changedSensitive)
        return
      }
    }

    updateMutation.mutate(normalized)
  }

  function handleConfirmReverifySave() {
    const normalized = normalizeProfileInput(formValues)
    updateMutation.mutate(normalized)
  }

  const badge = VERIFICATION_BADGE_STYLES[profile.verification_status]

  return (
    <>
      <section className="rounded-2xl border border-edge bg-panel p-6 sm:p-8">
        {/* Status Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-well text-white">
              <UserCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-white">Formulir Identitas Mahasiswa</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {profile.age !== null && (
              <span
                data-testid="profile-age-badge"
                className="rounded-full border border-edge bg-well px-3 py-1 text-xs font-medium text-ink-2"
              >
                Usia: {profile.age} tahun
              </span>
            )}
            <span
              data-testid="profile-verification-badge"
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Rejection Note Banner */}
        {profile.verification_status === 'ditolak' && (
          <div
            role="alert"
            data-testid="profile-rejection-banner"
            className="mt-5 rounded-xl border border-rose-500/40 bg-rose-950/35 px-4 py-3 text-xs text-rose-200"
          >
            <p className="font-semibold text-white">Catatan Penolakan Superadmin:</p>
            <p className="mt-0.5">
              {profile.verification_note ||
                'Silakan periksa kembali kesesuaian data diri dan dokumen identitas Anda.'}
            </p>
          </div>
        )}

        {/* Terverifikasi Caution Notice */}
        {profile.verification_status === 'terverifikasi' && (
          <div
            data-testid="verified-caution-banner"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-4 py-3 text-xs text-emerald-200"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span>
              Akun Anda telah <strong className="text-white">Terverifikasi</strong>. Mengubah{' '}
              <strong className="text-white">Nama Lengkap</strong>,{' '}
              <strong className="text-white">NIM</strong>, atau{' '}
              <strong className="text-white">Institusi</strong> akan meminta konfirmasi dan
              mengembalikan status verifikasi ke <strong className="text-white">Menunggu Verifikasi</strong>.
            </span>
          </div>
        )}

        {/* Deadline Passed Warning */}
        {deadlinePassed && (
          <div
            role="alert"
            className="mt-5 flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-xs text-amber-200"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>
              Tenggat pendaftaran telah terlewat. Server akan menolak perubahan data diri baru.
            </span>
          </div>
        )}

        {/* Under-18 Minor Informational Callout (UU PDP Pasal 4 ayat 2) */}
        {isMinorPreview && (
          <div
            data-testid="minor-participant-notice"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-sky/35 bg-sky/10 px-4 py-3 text-xs text-sky"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
            <span>
              Berdasarkan tanggal lahir, usia peserta berada di bawah 18 tahun (kategori data anak
              UU PDP Pasal 4 ayat 2). Pendaftaran <strong className="text-white">tidak ditolak otomatis</strong>;
              status usia akan ditandai untuk peninjauan manual oleh Superadmin.
            </span>
          </div>
        )}

        {/* Server Error Banner */}
        {serverError && (
          <div
            role="alert"
            data-testid="profile-error-alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Save Success Banner */}
        {saveSuccessMessage && (
          <div
            role="status"
            data-testid="profile-success-alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{saveSuccessMessage}</span>
            </div>
            <Link
              to="/documents"
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-400/40 bg-well px-3 py-1.5 text-xs font-semibold text-white transition hover:border-emerald-300"
            >
              Lanjut ke Dokumen
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* 7-Field Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* 1. full_name */}
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-full_name" className="text-xs font-medium text-ink-2">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-ink-3">1–100 karakter (sesuai KTP/KTM)</span>
              </div>
              <input
                id="profile-full_name"
                name="full_name"
                type="text"
                maxLength={100}
                value={formValues.full_name}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                placeholder="Contoh: Budi Santoso"
                aria-invalid={Boolean(fieldErrors.full_name)}
                aria-describedby={fieldErrors.full_name ? 'error-full_name' : undefined}
                className="w-full rounded-xl border border-edge bg-well px-3.5 py-2.5 text-sm text-white placeholder:text-ink-3 focus:border-sky-soft/40 focus:outline-none"
              />
              {fieldErrors.full_name && (
                <p id="error-full_name" className="mt-1.5 text-xs text-rose-400">
                  {fieldErrors.full_name}
                </p>
              )}
            </div>

            {/* 2. nim */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-nim" className="text-xs font-medium text-ink-2">
                  NIM / NRP <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-ink-3">Alfanumerik, 5–20 karakter</span>
              </div>
              <input
                id="profile-nim"
                name="nim"
                type="text"
                maxLength={20}
                value={formValues.nim}
                onChange={(e) => handleFieldChange('nim', e.target.value)}
                placeholder="Contoh: 5025231001"
                aria-invalid={Boolean(fieldErrors.nim)}
                aria-describedby={fieldErrors.nim ? 'error-nim' : undefined}
                className="w-full rounded-xl border border-edge bg-well px-3.5 py-2.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-ink-3 focus:border-sky-soft/40 focus:outline-none"
              />
              {fieldErrors.nim && (
                <p id="error-nim" className="mt-1.5 text-xs text-rose-400">
                  {fieldErrors.nim}
                </p>
              )}
            </div>

            {/* 3. study_program */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  htmlFor="profile-study_program"
                  className="text-xs font-medium text-ink-2"
                >
                  Program Studi <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-ink-3">2–100 karakter</span>
              </div>
              <input
                id="profile-study_program"
                name="study_program"
                type="text"
                maxLength={100}
                value={formValues.study_program}
                onChange={(e) => handleFieldChange('study_program', e.target.value)}
                placeholder="Contoh: Teknik Informatika"
                aria-invalid={Boolean(fieldErrors.study_program)}
                aria-describedby={fieldErrors.study_program ? 'error-study_program' : undefined}
                className="w-full rounded-xl border border-edge bg-well px-3.5 py-2.5 text-sm text-white placeholder:text-ink-3 focus:border-sky-soft/40 focus:outline-none"
              />
              {fieldErrors.study_program && (
                <p id="error-study_program" className="mt-1.5 text-xs text-rose-400">
                  {fieldErrors.study_program}
                </p>
              )}
            </div>

            {/* 4. institution */}
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-institution" className="text-xs font-medium text-ink-2">
                  Institusi / Perguruan Tinggi <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-ink-3">2–100 karakter</span>
              </div>
              <input
                id="profile-institution"
                name="institution"
                type="text"
                maxLength={100}
                value={formValues.institution}
                onChange={(e) => handleFieldChange('institution', e.target.value)}
                placeholder="Contoh: Institut Teknologi Sepuluh Nopember"
                aria-invalid={Boolean(fieldErrors.institution)}
                aria-describedby={fieldErrors.institution ? 'error-institution' : undefined}
                className="w-full rounded-xl border border-edge bg-well px-3.5 py-2.5 text-sm text-white placeholder:text-ink-3 focus:border-sky-soft/40 focus:outline-none"
              />
              {fieldErrors.institution && (
                <p id="error-institution" className="mt-1.5 text-xs text-rose-400">
                  {fieldErrors.institution}
                </p>
              )}
            </div>

            {/* 5. birth_date */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-birth_date" className="text-xs font-medium text-ink-2">
                  Tanggal Lahir <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-ink-3">YYYY-MM-DD (tidak di masa depan)</span>
              </div>
              <input
                id="profile-birth_date"
                name="birth_date"
                type="date"
                max={todayIso}
                value={formValues.birth_date}
                onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                aria-invalid={Boolean(fieldErrors.birth_date)}
                aria-describedby={fieldErrors.birth_date ? 'error-birth_date' : undefined}
                className="w-full rounded-xl border border-edge bg-well px-3.5 py-2.5 text-sm text-white scheme-dark focus:border-sky-soft/40 focus:outline-none"
              />
              {fieldErrors.birth_date && (
                <p id="error-birth_date" className="mt-1.5 text-xs text-rose-400">
                  {fieldErrors.birth_date}
                </p>
              )}
            </div>

            {/* 6. domicile */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-domicile" className="text-xs font-medium text-ink-2">
                  Domisili (Kota / Kabupaten) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-ink-3">2–60 karakter</span>
              </div>
              <input
                id="profile-domicile"
                name="domicile"
                type="text"
                maxLength={60}
                value={formValues.domicile}
                onChange={(e) => handleFieldChange('domicile', e.target.value)}
                placeholder="Contoh: Surabaya"
                aria-invalid={Boolean(fieldErrors.domicile)}
                aria-describedby={fieldErrors.domicile ? 'error-domicile' : undefined}
                className="w-full rounded-xl border border-edge bg-well px-3.5 py-2.5 text-sm text-white placeholder:text-ink-3 focus:border-sky-soft/40 focus:outline-none"
              />
              {fieldErrors.domicile && (
                <p id="error-domicile" className="mt-1.5 text-xs text-rose-400">
                  {fieldErrors.domicile}
                </p>
              )}
            </div>

            {/* 7. phone */}
            <div className="sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label htmlFor="profile-phone" className="text-xs font-medium text-ink-2">
                  Nomor HP (WhatsApp) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-ink-3">
                  Diawali 08 atau +62, total 10–15 digit
                </span>
              </div>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                maxLength={16}
                value={formValues.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="Contoh: 081234567890 atau +6281234567890"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'error-phone' : undefined}
                className="w-full rounded-xl border border-edge bg-well px-3.5 py-2.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-ink-3 focus:border-sky-soft/40 focus:outline-none"
              />
              {fieldErrors.phone && (
                <p id="error-phone" className="mt-1.5 text-xs text-rose-400">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-5">
            <div className="flex items-center gap-2 text-xs text-ink-3">
              <Lock className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden="true" />
              <span>
                NIK tidak diminta pada form karena sudah tercantum pada scan KTP (UU PDP Pasal 16).
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetToSaved}
                disabled={updateMutation.isPending}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-edge bg-well px-3.5 py-2.5 text-xs font-medium text-ink-2 transition hover:border-sky/70 hover:text-white disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#ededed] px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                {updateMutation.isPending ? 'Menyimpan Enkripsi...' : 'Simpan Profil'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Re-verification Confirmation Prompt Modal */}
      {pendingReverifyFields && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reverify-modal-title"
          data-testid="reverify-confirm-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ground/90 px-4"
        >
          <div className="w-full max-w-md rounded-2xl border border-edge bg-panel p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-950/50 text-amber-300">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="reverify-modal-title" className="text-base font-semibold text-white">
                  Konfirmasi Verifikasi Ulang
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
                  Akun Anda saat ini sudah berstatus{' '}
                  <strong className="text-emerald-300">Terverifikasi</strong>. Anda mengubah field
                  identitas utama berikut:
                </p>
                <ul className="mt-2.5 list-inside list-disc space-y-1 rounded-xl border border-edge bg-well px-3.5 py-2.5 text-xs font-medium text-amber-200">
                  {pendingReverifyFields.map((field) => (
                    <li key={field}>{PROFILE_FIELD_LABELS[field]}</li>
                  ))}
                </ul>
                <p className="mt-2.5 text-xs leading-relaxed text-ink-3">
                  Menyimpan perubahan ini akan mengembalikan status Anda menjadi{' '}
                  <strong className="text-white">Menunggu Verifikasi</strong> hingga Superadmin
                  memeriksa ulang data Anda.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingReverifyFields(null)}
                disabled={updateMutation.isPending}
                className="cursor-pointer rounded-xl border border-edge bg-well px-4 py-2 text-xs font-medium text-ink-2 transition hover:border-sky/70 hover:text-white disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReverifySave}
                disabled={updateMutation.isPending}
                className="cursor-pointer rounded-md bg-[#ededed] px-4 py-2 text-xs font-semibold text-black transition hover:bg-white disabled:opacity-50"
              >
                {updateMutation.isPending
                  ? 'Menyimpan...'
                  : 'Ya, Simpan & Verifikasi Ulang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: ({ signal }) => apiClient.profile.get(signal),
  })

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => apiClient.public.getSettings(signal),
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-edge bg-panel p-6">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Kembali ke Dashboard
          </Link>
          <h1 className={PAGE_TITLE}>
            Encrypted Personal Profile
          </h1>
        </div>

        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 rounded-xl border border-edge bg-well px-3.5 py-2 text-xs font-medium text-ink-2 transition hover:border-sky/70 hover:text-white"
        >
          Kelola Dokumen Identitas
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </header>

      {profileQuery.isLoading && (
        <div
          role="status"
          data-testid="profile-loading"
          className="rounded-2xl border border-edge bg-panel p-6 text-center text-sm text-ink-3"
        >
          Mendekripsi dan memuat profil peserta...
        </div>
      )}

      {profileQuery.isError && (
        <section
          role="alert"
          data-testid="profile-load-error"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-5 py-4 text-sm text-rose-200"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>
              {isApiClientError(profileQuery.error)
                ? profileQuery.error.message
                : 'Gagal memuat profil peserta dari server.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void profileQuery.refetch()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-400/40 bg-well px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-950"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Coba Lagi
          </button>
        </section>
      )}

      {profileQuery.data && (
        <ProfileFormCard
          profile={profileQuery.data}
          registrationDeadlineIso={settingsQuery.data?.registration_deadline ?? null}
        />
      )}
    </div>
  )
}
