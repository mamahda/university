import {
  AlertCircle,
  Eye,
  FileText,
  IdCard,
  Image as ImageIcon,
  ShieldAlert,
  Video,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { apiClient, isApiClientError, type ItemField, type ItemMeta } from '@/api'
import { BTN_SECONDARY, RECESSED, WELL } from '@/components/ui/tokens'
import { formatTimestamp } from '@/lib/datetime'
import { formatBytes } from '@/lib/fileValidation'

const FIELD_ICONS: Record<ItemField, typeof FileText> = {
  ktp: IdCard,
  ktm: IdCard,
  twibbon: ImageIcon,
  proposal: FileText,
  video: Video,
}

interface ItemBlobViewerProps {
  field: ItemField
  label: string
  item: ItemMeta | null
  /** Shown in place of the metadata when the item was never uploaded. */
  emptyText?: string
}

/**
 * Reads one encrypted item as a full authenticated blob and renders it inline.
 *
 * `GET /api/items/{item_id}` verifies all three ciphertexts' HMAC tags and
 * their chunk-by-chunk equality before releasing a single byte, so there is no
 * partial or streamed form of this request to fall back on: the viewer holds
 * the whole blob behind an Object URL and revokes it on unmount, on a reload,
 * and before replacing it.
 */
export function ItemBlobViewer({ field, label, item, emptyText }: ItemBlobViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ message: string; isIntegrityFailure: boolean } | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }
  }, [])

  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setObjectUrl(null)
  }

  async function handleView(meta: ItemMeta) {
    setIsLoading(true)
    setError(null)
    releaseObjectUrl()

    try {
      // No `?download=1`: this opens the item for inspection, it does not save it.
      const fetched = await apiClient.items.getBlob(meta.item_id)
      const nextUrl = URL.createObjectURL(fetched.blob)
      objectUrlRef.current = nextUrl
      setObjectUrl(nextUrl)
      setMediaType(fetched.content_type || meta.content_type)
    } catch (err) {
      setError({
        message: isApiClientError(err)
          ? `${err.code}: ${err.message}`
          : 'Gagal membuka berkas ini.',
        isIntegrityFailure: isApiClientError(err) && err.isIntegrityError(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const Icon = FIELD_ICONS[field]
  const resolvedType = mediaType ?? item?.content_type ?? ''
  const viewerKind = resolvedType.startsWith('video/')
    ? 'video'
    : resolvedType.startsWith('image/')
      ? 'image'
      : 'pdf'

  return (
    <article data-testid={`artifact-${field}`} className={`${WELL} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Icon className="h-4 w-4 text-ink-3" aria-hidden="true" />
            {label}
          </h3>
          {item ? (
            <p className="mt-1 text-sm break-all text-ink-2">
              {item.original_filename ?? '(tanpa nama berkas)'}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-3">
              {emptyText ?? 'Tidak ada berkas yang diunggah.'}
            </p>
          )}
        </div>

        {item ? (
          <button
            type="button"
            data-testid={`view-btn-${field}`}
            onClick={() => void handleView(item)}
            disabled={isLoading}
            className={BTN_SECONDARY}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            {isLoading ? 'Membuka...' : 'Buka berkas'}
          </button>
        ) : null}
      </div>

      {item ? (
        <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className={`${RECESSED} px-3 py-2`}>
            <dt className="text-xs text-ink-3">Ukuran</dt>
            <dd className="mt-0.5 text-sm tabular-nums text-ink-2">
              {formatBytes(item.size_bytes)}
            </dd>
          </div>
          <div className={`${RECESSED} px-3 py-2`}>
            <dt className="text-xs text-ink-3">Tipe</dt>
            <dd className="mt-0.5 text-sm text-ink-2">{item.content_type}</dd>
          </div>
          <div className={`${RECESSED} px-3 py-2`}>
            <dt className="text-xs text-ink-3">Diunggah</dt>
            <dd className="mt-0.5 text-sm text-ink-2">{formatTimestamp(item.uploaded_at)}</dd>
          </div>
          <div className={`${RECESSED} px-3 py-2 sm:col-span-3`}>
            <dt className="text-xs text-ink-3">Item ID</dt>
            <dd className="mt-0.5 font-mono text-xs break-all text-ink-2">{item.item_id}</dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p
          data-testid={`viewer-error-${field}`}
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-200"
        >
          {error.isIntegrityFailure ? (
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>
            {error.message}
            {error.isIntegrityFailure ? (
              <span className="mt-1 block text-red-300">
                Berkas tidak ditampilkan karena verifikasi integritas gagal. Insiden ini sudah
                tercatat di audit log; hubungi panitia sebelum mengambil keputusan.
              </span>
            ) : null}
          </span>
        </p>
      ) : null}

      {objectUrl && viewerKind === 'pdf' ? (
        <iframe
          data-testid="artifact-viewer-pdf"
          src={objectUrl}
          title={`${label} — ${item?.original_filename ?? 'berkas'}`}
          className="mt-3 h-[32rem] w-full rounded-xl border border-edge bg-black"
        />
      ) : null}

      {objectUrl && viewerKind === 'video' ? (
        <video
          data-testid="artifact-viewer-video"
          src={objectUrl}
          controls
          className="mt-3 w-full rounded-xl border border-edge bg-black"
        >
          <track kind="captions" />
        </video>
      ) : null}

      {objectUrl && viewerKind === 'image' ? (
        <img
          data-testid="artifact-viewer-image"
          src={objectUrl}
          alt={`${label} — ${item?.original_filename ?? 'berkas'}`}
          className="mt-3 max-h-[32rem] w-full rounded-xl border border-edge bg-black object-contain"
        />
      ) : null}
    </article>
  )
}
