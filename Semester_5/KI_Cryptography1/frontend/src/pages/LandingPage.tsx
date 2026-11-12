import { useQuery } from '@tanstack/react-query'
import { Eye, Lock, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiClient, type PublicSettings, type UserRole } from '@/api'
import { SpaceScene } from '@/components/ui/SpaceScene'
import { CARD, NAV_BTN_FILLED, NAV_BTN_OUTLINE } from '@/components/ui/tokens'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

const FEATURES: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: Lock,
    title: 'Tiga cipher, satu data',
    body: 'Setiap isian disimpan sebagai tiga ciphertext terpisah: AES-CTR, DES-CTR, dan RC4.',
  },
  {
    Icon: ShieldCheck,
    title: 'Integritas terverifikasi',
    body: 'HMAC-SHA256 ketiganya diperiksa dan didekripsi penuh sebelum file dikirim.',
  },
  {
    Icon: Eye,
    title: 'Akses sesuai peran',
    body: 'Peserta, juri, dan superadmin hanya membuka yang menjadi haknya, dan tercatat di audit log.',
  },
]

const mb = (bytes: number) => Math.round(bytes / 1_048_576)

function dashboardPath(role: UserRole): string {
  if (role === 'juri') return '/juri/teams'
  return role === 'superadmin' ? '/admin/participants' : '/dashboard'
}

export function LandingPage() {
  const user = useAuthStore((state) => state.user)
  const { data, isLoading, isError } = useQuery<PublicSettings>({
    queryKey: ['settings'],
    queryFn: ({ signal }) => apiClient.public.getSettings(signal),
  })

  return (
    <div className="relative w-full overflow-hidden bg-ground">
      <SpaceScene className="pointer-events-none absolute inset-0 h-full w-full" />
      {/* A scrim so the copy keeps its contrast over the scene on small screens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-ground/75 lg:bg-transparent"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col justify-center gap-10 px-4 py-12">
        {/* The scene carries the left half at desktop width; the copy takes the right. */}
        <section className="lg:ml-auto lg:w-1/2 lg:pl-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-sky/40 px-3 py-1 text-xs font-medium text-sky">
              Hackathon khusus mahasiswa
            </span>
            <span
              data-testid="api-mode-badge"
              className="rounded-full border border-edge bg-well px-3 py-1 text-xs font-medium text-ink-3"
            >
              {env.enableMsw ? 'MSW Mock Mode' : 'API Proxy Mode'}
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl leading-tight font-bold text-ink sm:text-5xl">
            Platform Pendaftaran Schematics NIC
          </h1>
          <p className="mt-4 max-w-xl text-base text-ink-2">
            Daftarkan tim, unggah dokumen, dan kumpulkan karya di satu tempat. Data Anda
            disimpan dalam tiga ciphertext yang hanya terbuka bagi pihak berhak.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {user ? (
              <Link to={dashboardPath(user.role)} className={NAV_BTN_FILLED}>
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className={NAV_BTN_FILLED}>
                  Daftar Peserta
                </Link>
                <Link to="/login" className={NAV_BTN_OUTLINE}>
                  Masuk
                </Link>
              </>
            )}
          </div>
        </section>

        <section aria-label="Keamanan data" className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, body }) => (
            <article key={title} className={`${CARD} p-5`}>
              <Icon className="h-5 w-5 text-sky" aria-hidden="true" />
              <h2 className="mt-3 font-display text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-1.5 text-sm text-ink-2">{body}</p>
            </article>
          ))}
        </section>

        <section aria-label="Ketentuan lomba" className={`${CARD} p-5`}>
          {isLoading && <p className="text-sm text-ink-3">Memuat ketentuan lomba...</p>}
          {isError && (
            <p className="text-sm text-amber-300">
              Backend belum bisa dijangkau di <code>/api/settings</code> (jalankan FastAPI atau
              pakai <code>VITE_ENABLE_MSW=true</code>).
            </p>
          )}
          {data && (
            <dl className="grid gap-4 sm:grid-cols-3" data-testid="settings-summary">
              <div>
                <dt className="text-xs text-ink-3">Ukuran tim</dt>
                <dd className="mt-0.5 font-display text-xl font-semibold text-ink">
                  {data.min_team_size}–{data.max_team_size} anggota
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Maks. dokumen / proposal</dt>
                <dd className="mt-0.5 font-display text-xl font-semibold text-ink">
                  {mb(data.limits.document_max_bytes)} MB / {mb(data.limits.proposal_max_bytes)} MB
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Maks. video demo</dt>
                <dd className="mt-0.5 font-display text-xl font-semibold text-ink">
                  {mb(data.limits.video_max_bytes)} MB
                </dd>
              </div>
            </dl>
          )}
        </section>
      </div>
    </div>
  )
}
