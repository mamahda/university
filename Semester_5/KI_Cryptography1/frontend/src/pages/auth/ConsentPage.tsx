import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, FileCheck2, RefreshCw } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { apiClient, isApiClientError } from '@/api'
import {
  isRouteAllowedForRole,
  needsPrivacyConsent,
  useAuthStore,
} from '@/stores/authStore'
import { sanitizeReturnPath } from './authNavigation'

function SafePolicyMarkdown({ markdown }: { markdown: string }) {
  const lines = markdown.split(/\r?\n/)

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-ink-2">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim()
        if (!line) {
          return null
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="pt-2 text-sm font-semibold text-white">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="pt-1 text-base font-bold text-white">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={index} className="pt-1 text-lg font-bold text-white">
              {line.slice(2)}
            </h2>
          )
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-2" />
              <span>{line.slice(2)}</span>
            </div>
          )
        }
        return <p key={index}>{line}</p>
      })}
    </div>
  )
}

export function ConsentPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  const user = useAuthStore((state) => state.user)
  const [agreed, setAgreed] = useState(false)
  const [outdatedNotice, setOutdatedNotice] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const rawFrom =
    typeof location.state === 'object' && location.state !== null && 'from' in location.state
      ? (location.state as { from?: unknown }).from
      : undefined
  const cleanFrom = sanitizeReturnPath(rawFrom)
  const fromPathname = cleanFrom ? (cleanFrom.split('?')[0] ?? '') : ''
  const targetAfterConsent =
    cleanFrom && isRouteAllowedForRole(fromPathname, 'peserta') ? cleanFrom : '/dashboard'

  const policyQuery = useQuery({
    queryKey: ['policy'],
    queryFn: ({ signal }) => apiClient.public.getPolicy(signal),
    staleTime: 0,
  })

  const consentMutation = useMutation({
    mutationFn: apiClient.consent.accept,
    onSuccess: (consent) => {
      setOutdatedNotice(null)
      setSubmitError(null)
      useAuthStore.getState().updateUserConsent(consent)
      queryClient.setQueryData(['auth', 'me'], () => useAuthStore.getState().user)
      void navigate(targetAfterConsent, { replace: true })
    },
    onError: async (err) => {
      if (isApiClientError(err) && err.code === 'policy_outdated') {
        setAgreed(false)
        setSubmitError(null)
        setOutdatedNotice(
          'Pemberitahuan privasi telah diperbarui ke versi terbaru. Dokumen terbaru sedang dimuat ulang—silakan tinjau kembali dan centang persetujuan ulang.',
        )
        const [freshPolicy] = await Promise.all([
          policyQuery.refetch(),
          apiClient.auth
            .getMe()
            .then((me) => {
              useAuthStore.getState().setSessionUser(me)
              queryClient.setQueryData(['auth', 'me'], me)
            })
            .catch(() => undefined),
        ])
        if (freshPolicy.data) {
          useAuthStore.getState().markConsentOutdated(freshPolicy.data.version)
        }
        return
      }

      if (isApiClientError(err)) {
        setSubmitError(err.message || 'Gagal menyimpan persetujuan privasi.')
        return
      }
      setSubmitError('Terjadi kesalahan jaringan saat menyimpan persetujuan.')
    },
  })

  if (user && !needsPrivacyConsent(user) && !consentMutation.isPending) {
    return <Navigate to={targetAfterConsent} replace />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!policyQuery.data || !agreed) {
      return
    }
    setSubmitError(null)
    consentMutation.mutate({
      policy_version: policyQuery.data.version,
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="rounded-2xl border border-edge bg-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-well text-white">
              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Pemberitahuan Privasi &amp; Persetujuan Eksplisit
            </h1>
          </div>

          {policyQuery.data && (
            <span
              data-testid="policy-version-badge"
              className="rounded-full border border-edge bg-well px-3 py-1 text-xs font-semibold text-ink-2"
            >
              Versi {policyQuery.data.version}
            </span>
          )}
        </div>

        {outdatedNotice && (
          <div
            role="alert"
            data-testid="policy-outdated-alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-950/50 px-4 py-3 text-sm text-amber-200"
          >
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>{outdatedNotice}</span>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            data-testid="consent-error-alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/50 px-4 py-3 text-sm text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="mt-5">
          {policyQuery.isLoading && (
            <div
              role="status"
              className="rounded-xl border border-edge bg-well p-6 text-center text-sm text-ink-3"
            >
              Memuat teks pemberitahuan privasi terbaru...
            </div>
          )}

          {policyQuery.isError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/40 bg-rose-950/50 p-4 text-sm text-rose-200"
            >
              <p>Gagal memuat dokumen pemberitahuan privasi dari server.</p>
              <button
                type="button"
                onClick={() => void policyQuery.refetch()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-well px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-950"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Coba Muat Ulang
              </button>
            </div>
          )}

          {policyQuery.data && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div
                data-testid="policy-markdown-box"
                className="max-h-80 overflow-y-auto rounded-xl border border-edge bg-well p-4"
              >
                <SafePolicyMarkdown markdown={policyQuery.data.text_markdown} />
              </div>

              <label
                htmlFor="consent-checkbox"
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-edge bg-well/60 p-3.5 transition hover:border-sky/70"
              >
                <input
                  id="consent-checkbox"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-edge bg-well text-white focus:ring-sky"
                />
                <span className="text-sm text-ink-2">
                  Saya telah membaca, memahami, dan secara eksplisit menyetujui pemrosesan serta
                  enkripsi data pribadi saya sesuai Pemberitahuan Privasi Schematics NIC{' '}
                  <strong className="text-white">versi {policyQuery.data.version}</strong>.
                </span>
              </label>

              <button
                type="submit"
                disabled={!agreed || consentMutation.isPending || policyQuery.isFetching}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#ededed] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {consentMutation.isPending
                  ? 'Menyimpan persetujuan...'
                  : 'Setujui & Lanjutkan ke Pendaftaran'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
