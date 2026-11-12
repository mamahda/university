import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import {
  apiClient,
  isApiClientError,
  type ItemField,
  type ItemMeta,
} from '@/api'
import { formatBytes } from '@/lib/fileValidation'
import { useAuthStore } from '@/stores/authStore'
import {
  BTN_SECONDARY,
  CARD,
  PAGE_TITLE,
  WELL,
} from '@/components/ui/tokens'


/** One upload becomes three independent ciphertexts (AES-CTR, DES-CTR, RC4). */
const CIPHERTEXT_COPIES = 3

/**
 * The contract measures storage overhead as "data tiga kali lipat + sekitar
 * 344 byte metadata per item" — nonce, wrapped keys, HMAC tag and key version
 * for each of the three branches. "Sekitar" is the contract's word, so this is
 * labelled an estimate in the UI.
 */
const ITEM_METADATA_OVERHEAD_BYTES = 344

function ciphertextFootprintBytes(sizeBytes: number): number {
  return CIPHERTEXT_COPIES * sizeBytes + ITEM_METADATA_OVERHEAD_BYTES
}

const FIELD_LABELS: Record<ItemField, string> = {
  ktp: 'Scan KTP',
  ktm: 'KTM / KRSM',
  twibbon: 'Twibbon',
  proposal: 'Proposal PDF',
  video: 'Video Demo MP4',
}

interface CipherSpec {
  key: 'aes' | 'des' | 'rc4'
  name: string
  mode: string
  keySize: string
  nonce: string
  call: string
}

/** Transcribed from the contract's cipher table; not inferred. */
const CIPHER_SPECS: CipherSpec[] = [
  {
    key: 'aes',
    name: 'AES-CTR',
    mode: 'CTR (keystream XOR plaintext)',
    keySize: 'kunci 32 byte',
    nonce: 'nonce 8 byte acak + counter 8 byte',
    call: 'AES.new(k, AES.MODE_CTR, nonce=n)',
  },
  {
    key: 'des',
    name: 'DES-CTR',
    mode: 'CTR (keystream XOR plaintext)',
    keySize: 'kunci 8 byte (56 bit efektif)',
    nonce: 'nonce 4 byte acak + counter 4 byte (maks 32 GiB per kunci)',
    call: 'DES.new(k, DES.MODE_CTR, nonce=n)',
  },
  {
    key: 'rc4',
    name: 'RC4',
    mode: 'Stream',
    keySize: 'kunci 16 byte',
    nonce: 'tanpa nonce; 3072 byte awal keystream dibuang',
    call: 'ARC4.new(k, drop=3072)',
  },
]

type VerifyState =
  | { status: 'idle' }
  | { status: 'verifying' }
  | { status: 'ok'; digest: string; bytes: number; contentType: string }
  | { status: 'error'; message: string; isIntegrityFailure: boolean }

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function EncryptionInspectorPage() {
  const user = useAuthStore((state) => state.user)
  const [verifyStates, setVerifyStates] = useState<Partial<Record<ItemField, VerifyState>>>({})

  // `/api/documents` and `/api/teams/me` are peserta-scoped. A juri or superadmin
  // reaches this route too, and firing those calls for them answers 401 — which
  // the client treats as a dead session and logs them out.
  const isPeserta = user?.role === 'peserta'

  const documentsQuery = useQuery({
    queryKey: ['documents'],
    queryFn: ({ signal }) => apiClient.documents.list(signal),
    enabled: isPeserta,
  })

  const teamQuery = useQuery({
    queryKey: ['teams', 'me'],
    queryFn: ({ signal }) => apiClient.teams.getMine(signal),
    enabled: isPeserta,
  })

  const documents = documentsQuery.data
  const team = teamQuery.data?.team ?? null

  // The contract has no item-list endpoint: GET /api/items/{item_id} is the only
  // way in, and the ids already travel inside the ItemMeta the frontend holds.
  const items: ItemMeta[] = [
    documents?.ktp,
    documents?.ktm,
    documents?.twibbon,
    team?.submission.proposal,
    team?.submission.video,
  ].filter((item): item is ItemMeta => Boolean(item))

  const isLoading = documentsQuery.isLoading || teamQuery.isLoading
  const totalPlaintextBytes = items.reduce((sum, item) => sum + item.size_bytes, 0)
  const totalFootprintBytes = items.reduce(
    (sum, item) => sum + ciphertextFootprintBytes(item.size_bytes),
    0,
  )

  function setVerifyState(field: ItemField, state: VerifyState) {
    setVerifyStates((prev) => ({ ...prev, [field]: state }))
  }

  async function handleVerify(item: ItemMeta) {
    setVerifyState(item.field, { status: 'verifying' })

    try {
      // No ?download=1: this reads the item for inspection, it does not save it.
      const fetched = await apiClient.items.getBlob(item.item_id)
      const buffer = await fetched.blob.arrayBuffer()
      const digest = await sha256Hex(buffer)

      setVerifyState(item.field, {
        status: 'ok',
        digest,
        bytes: buffer.byteLength,
        contentType: fetched.content_type,
      })
    } catch (err) {
      setVerifyState(item.field, {
        status: 'error',
        message: isApiClientError(err)
          ? err.message
          : 'Gagal memverifikasi proteksi item ini.',
        isIntegrityFailure: isApiClientError(err) && err.isIntegrityError(),
      })
    }
  }

  return (
    <div data-testid="encryption-inspector-page" className="space-y-6">
      <header>
        <h1 className={PAGE_TITLE}>
          Encryption &amp; Integrity Inspector
        </h1>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Cipher specs                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="cipher-spec-heading" className={`${CARD} p-6`}>
        <div className="flex items-center gap-3 border-b border-edge pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge bg-well text-white">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 id="cipher-spec-heading" className="text-base font-semibold text-white">
            Spesifikasi Tiga Cabang Cipher
          </h2>
        </div>

        <ul data-testid="cipher-spec-table" className="mt-4 space-y-2.5">
          {CIPHER_SPECS.map((spec) => (
            <li
              key={spec.key}
              data-testid={`cipher-spec-${spec.key}`}
              className={`${WELL} px-3.5 py-3 text-sm`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono font-semibold text-white">{spec.name}</span>
                <span className="text-ink-3">{spec.mode}</span>
              </div>
              <p className="mt-1 text-ink-2">
                {spec.keySize} · {spec.nonce}
              </p>
              <p className="mt-1 font-mono text-sm break-all text-ink-3">{spec.call}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div data-testid="integrity-spec" className={`${WELL} px-3.5 py-3 text-sm`}>
            <div className="flex items-center gap-2 font-medium text-white">
              <Fingerprint className="h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
              HMAC-SHA256 per ciphertext
            </div>
            <p className="mt-1.5 text-ink-3">
              Pola encrypt-then-MAC, satu tag untuk setiap ciphertext, dengan kunci HMAC 32 byte
              yang terpisah dari kunci enkripsi. Input tag ={' '}
              <span className="font-mono text-ink-2">
                item_id ‖ field ‖ cipher ‖ nonce ‖ ciphertext
              </span>
              .
            </p>
          </div>

          <div data-testid="kek-spec" className={`${WELL} px-3.5 py-3 text-sm`}>
            <div className="flex items-center gap-2 font-medium text-white">
              <KeyRound className="h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
              Pembungkus kunci: AES-256-GCM
            </div>
            <p className="mt-1.5 text-ink-3">
              Kunci enkripsi dan kunci HMAC dibungkus AES-256-GCM dengan nonce 12 byte dan AAD ={' '}
              <span className="font-mono text-ink-2">item_id ‖ cipher</span>, memakai satu root
              key 32 byte sebagai KEK yang tidak pernah masuk repo.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Item inventory                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section aria-labelledby="inventory-heading" className={`${CARD} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge bg-well text-white">
              <Database className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 id="inventory-heading" className="text-base font-semibold text-white">
              Inventaris Item Terenkripsi
            </h2>
          </div>

          {items.length > 0 && (
            <div className="text-right text-sm">
              <p className="text-ink-3">
                Plaintext{' '}
                <span className="font-medium text-ink-2 tabular-nums">
                  {formatBytes(totalPlaintextBytes)}
                </span>
              </p>
              <p className="mt-0.5 text-ink-3">
                Tersimpan ±{' '}
                <span className="font-medium text-ink-2 tabular-nums">
                  {formatBytes(totalFootprintBytes)}
                </span>
              </p>
            </div>
          )}
        </div>

        {!isPeserta ? (
          <div
            data-testid="inventory-role-notice"
            className={`mt-4 flex items-start gap-2.5 ${WELL} px-3.5 py-3 text-sm text-ink-2`}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
            <span>
              Inventaris ini memuat item milik akun peserta yang sedang masuk. Peran juri dan
              superadmin membuka file tim lewat portalnya masing-masing, bukan dari halaman ini.
            </span>
          </div>
        ) : isLoading ? (
          <p
            role="status"
            data-testid="inventory-loading"
            className="mt-4 text-sm text-ink-2"
          >
            Memuat inventaris item terenkripsi...
          </p>
        ) : items.length === 0 ? (
          <div
            data-testid="inventory-empty-state"
            className={`mt-4 flex items-start gap-2.5 ${WELL} px-3.5 py-3 text-sm text-ink-2`}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
            <span>
              Belum ada item terenkripsi. Unggah dokumen identitas di Document Manager atau
              karya tim di Team Workspace, lalu kembali ke halaman ini untuk memeriksa
              proteksinya.
            </span>
          </div>
        ) : (
          <ul data-testid="item-inventory" className="mt-4 space-y-3">
            {items.map((item) => {
              const state = verifyStates[item.field] ?? { status: 'idle' }
              return (
                <li
                  key={item.item_id}
                  data-testid={`item-row-${item.field}`}
                  className={`${WELL} px-3.5 py-3 text-sm`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white">
                        {FIELD_LABELS[item.field]}{' '}
                        <span className="font-mono text-sm font-normal text-ink-3">
                          ({item.field})
                        </span>
                      </p>
                      <p className="mt-0.5 font-mono text-sm break-all text-ink-3">
                        {item.item_id}
                      </p>
                      <p className="mt-1 text-ink-3">
                        {item.original_filename} · {item.content_type}
                      </p>
                    </div>

                    <button
                      type="button"
                      data-testid={`verify-btn-${item.field}`}
                      onClick={() => void handleVerify(item)}
                      disabled={state.status === 'verifying'}
                      className={BTN_SECONDARY}
                    >
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      {state.status === 'verifying'
                        ? 'Memverifikasi...'
                        : 'Verify Protection & Integrity'}
                    </button>
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-edge-soft bg-well px-3 py-2">
                      <dt className="text-sm text-ink-3">Ukuran plaintext</dt>
                      <dd className="mt-0.5 font-medium text-ink tabular-nums">
                        {formatBytes(item.size_bytes)}
                      </dd>
                    </div>
                    <div className="rounded-xl border border-edge-soft bg-well px-3 py-2">
                      <dt className="text-sm text-ink-3">
                        Jejak 3× ciphertext (perkiraan)
                      </dt>
                      <dd className="mt-0.5 font-medium text-ink tabular-nums">
                        {formatBytes(ciphertextFootprintBytes(item.size_bytes))}
                      </dd>
                    </div>
                  </dl>

                  {state.status === 'ok' && (
                    <div
                      data-testid={`verify-result-${item.field}`}
                      className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-3.5 py-3 text-sm text-emerald-100"
                    >
                      <div className="flex items-center gap-2 font-medium text-white">
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-emerald-300"
                          aria-hidden="true"
                        />
                        Server melepas item ini: HMAC ketiga ciphertext cocok dan ketiga hasil
                        dekripsi identik.
                      </div>
                      <p className="mt-2 text-emerald-100/90">
                        Checksum SHA-256 yang dihitung di browser atas{' '}
                        <span className="font-medium tabular-nums">
                          {formatBytes(state.bytes)}
                        </span>{' '}
                        byte yang diterima ({state.contentType}):
                      </p>
                      <p className="mt-1.5 font-mono text-sm break-all text-white">
                        {state.digest}
                      </p>
                      <p className="mt-2 text-emerald-100/80">
                        Checksum ini adalah sidik jari byte yang Anda terima, bukan pembanding
                        terhadap nilai milik server — putusan integritas sepenuhnya milik server
                        dan tiba sebagai 200 atau 500 integrity_error.
                      </p>
                    </div>
                  )}

                  {state.status === 'error' && (
                    <div
                      role="alert"
                      data-testid={`verify-error-${item.field}`}
                      className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/35 px-3.5 py-3 text-sm text-rose-100"
                    >
                      <div className="flex items-start gap-2">
                        <ShieldAlert
                          className="mt-0.5 h-4 w-4 shrink-0 text-rose-300"
                          aria-hidden="true"
                        />
                        <div>
                          {state.isIntegrityFailure ? (
                            <>
                              <p className="font-semibold text-white">
                                Kegagalan Integritas Kriptografi (500 integrity_error)
                              </p>
                              <p className="mt-1">
                                Verifikasi HMAC salah satu dari tiga ciphertext gagal, atau
                                ketiga hasil dekripsi tidak identik. Server menolak mengirim
                                isinya dan mencatat insiden ini di audit log. Isi file tidak
                                dapat dipercaya lagi — unggah ulang item ini.
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-white">
                              Verifikasi tidak dapat diselesaikan
                            </p>
                          )}
                          <p className="mt-1 text-rose-100/90">{state.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
