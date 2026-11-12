import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { apiClient, isApiClientError, type PublicSettings } from '@/api'
import {
  BTN_PRIMARY,
  CARD,
  INPUT,
  LABEL,
  PAGE_TITLE,
  SECTION_HEADING,
  WELL,
} from '@/components/ui/tokens'

interface SettingsForm {
  registration_deadline: string
  submission_deadline: string
  min_team_size: string
  max_team_size: string
}

function toForm(settings: PublicSettings): SettingsForm {
  return {
    registration_deadline: settings.registration_deadline ?? '',
    submission_deadline: settings.submission_deadline ?? '',
    min_team_size: String(settings.min_team_size),
    max_team_size: String(settings.max_team_size),
  }
}

export function AdminSettingsPage() {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: ({ signal }) => apiClient.public.getSettings(signal),
  })

  /**
   * `edited` holds the admin's own edits and stays null until they type, so the
   * displayed form is derived from the server value without an effect and a
   * background refetch can never overwrite an edit in progress.
   */
  const [edited, setEdited] = useState<SettingsForm | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const form = edited ?? (settingsQuery.data ? toForm(settingsQuery.data) : null)

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form) {
        throw new Error('Pengaturan belum dimuat.')
      }
      return apiClient.admin.updateSettings({
        // An empty field clears the deadline; the contract accepts null there.
        registration_deadline: form.registration_deadline.trim() || null,
        submission_deadline: form.submission_deadline.trim() || null,
        min_team_size: Number(form.min_team_size),
        max_team_size: Number(form.max_team_size),
      })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated)
      setEdited(toForm(updated))
      setIsSaved(true)
    },
  })

  function update<K extends keyof SettingsForm>(key: K, value: string) {
    if (!form) {
      return
    }
    setEdited({ ...form, [key]: value })
    setFormError(null)
    setIsSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaved(false)
    if (!form) {
      return
    }

    const registration = form.registration_deadline.trim()
    const submission = form.submission_deadline.trim()
    const minSize = Number(form.min_team_size)
    const maxSize = Number(form.max_team_size)

    const unparseable = [registration, submission].some(
      (value) => value !== '' && Number.isNaN(Date.parse(value)),
    )
    if (unparseable) {
      setFormError(
        'Tenggat harus berupa timestamp ISO 8601 beserta offset, contoh 2026-11-20T23:59:00+07:00.',
      )
      return
    }
    if (!Number.isInteger(minSize) || minSize < 1 || !Number.isInteger(maxSize) || maxSize < 1) {
      setFormError('Jumlah anggota minimum dan maksimum harus bilangan bulat positif.')
      return
    }
    if (minSize > maxSize) {
      setFormError('Jumlah anggota minimum tidak boleh melebihi maksimum.')
      return
    }

    setFormError(null)
    saveMutation.mutate()
  }

  const requestError = saveMutation.isError
    ? isApiClientError(saveMutation.error)
      ? saveMutation.error.message
      : 'Gagal menyimpan pengaturan.'
    : null
  const shownError = formError ?? requestError

  return (
    <div data-testid="admin-settings-page" className="space-y-6">
      <header>
        <h1 className={PAGE_TITLE}>
          Pengaturan Kompetisi
        </h1>
      </header>

      <section className={`${CARD} p-6`} aria-labelledby="settings-heading">
        <h2 id="settings-heading" className={SECTION_HEADING}>
          Tenggat dan ukuran tim
        </h2>

        {settingsQuery.isPending ? (
          <p data-testid="settings-loading" className="mt-3 text-sm text-ink-3">
            Memuat pengaturan...
          </p>
        ) : null}

        {settingsQuery.isError ? (
          <p
            data-testid="settings-load-error"
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Gagal memuat pengaturan saat ini.</span>
          </p>
        ) : null}

        {form ? (
          <form onSubmit={handleSubmit} className="mt-3 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="registration-deadline-input" className={LABEL}>
                  Tenggat pendaftaran
                </label>
                <input
                  id="registration-deadline-input"
                  data-testid="registration-deadline-input"
                  type="text"
                  inputMode="text"
                  spellCheck={false}
                  value={form.registration_deadline}
                  onChange={(event) => update('registration_deadline', event.target.value)}
                  placeholder="2026-11-20T23:59:00+07:00"
                  className={`mt-1 ${INPUT} font-mono text-xs`}
                />
              </div>

              <div>
                <label htmlFor="submission-deadline-input" className={LABEL}>
                  Tenggat submission
                </label>
                <input
                  id="submission-deadline-input"
                  data-testid="submission-deadline-input"
                  type="text"
                  inputMode="text"
                  spellCheck={false}
                  value={form.submission_deadline}
                  onChange={(event) => update('submission_deadline', event.target.value)}
                  placeholder="2026-12-05T23:59:00+07:00"
                  className={`mt-1 ${INPUT} font-mono text-xs`}
                />
              </div>

              <div>
                <label htmlFor="min-team-size-input" className={LABEL}>
                  Anggota minimum per tim
                </label>
                <input
                  id="min-team-size-input"
                  data-testid="min-team-size-input"
                  type="number"
                  min={1}
                  step={1}
                  value={form.min_team_size}
                  onChange={(event) => update('min_team_size', event.target.value)}
                  className={`mt-1 ${INPUT}`}
                />
              </div>

              <div>
                <label htmlFor="max-team-size-input" className={LABEL}>
                  Anggota maksimum per tim
                </label>
                <input
                  id="max-team-size-input"
                  data-testid="max-team-size-input"
                  type="number"
                  min={1}
                  step={1}
                  value={form.max_team_size}
                  onChange={(event) => update('max_team_size', event.target.value)}
                  className={`mt-1 ${INPUT}`}
                />
              </div>
            </div>

            <p className={`${WELL} px-3 py-2.5 text-xs text-ink-3`}>
              Tenggat memakai format ISO 8601 lengkap dengan offset zona waktu, sehingga tidak ada
              penafsiran ganda antara server dan browser peserta.
            </p>

            <button
              type="submit"
              data-testid="save-settings-btn"
              disabled={saveMutation.isPending}
              className={BTN_PRIMARY}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan pengaturan'}
            </button>

            {isSaved ? (
              <p
                data-testid="settings-success"
                role="status"
                className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-2.5 text-sm text-emerald-200"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Pengaturan berhasil disimpan.
              </p>
            ) : null}

            {shownError ? (
              <p
                data-testid="settings-error"
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{shownError}</span>
              </p>
            ) : null}
          </form>
        ) : null}
      </section>
    </div>
  )
}
