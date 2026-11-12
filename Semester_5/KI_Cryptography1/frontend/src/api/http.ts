import { buildApiUrl } from '../config/env'
import { CSRF_HEADER_NAME, getCsrfToken, requiresCsrfHeader } from './csrf'
import {
  API_ERROR_CODES,
  ApiClientError,
  type ApiErrorCode,
  type ApiErrorDetails,
} from './errors'
import type { FetchedItemBlob, GetItemQueryParams, UploadProgress } from './types'

const KNOWN_ERROR_CODE_SET: ReadonlySet<string> = new Set(API_ERROR_CODES)

export type AuthLifecycleListener = (error: ApiClientError) => void

let unauthorizedListener: AuthLifecycleListener | null = null
let consentRequiredListener: AuthLifecycleListener | null = null

export function setUnauthorizedListener(listener: AuthLifecycleListener | null): void {
  unauthorizedListener = listener
}

export function setConsentRequiredListener(listener: AuthLifecycleListener | null): void {
  consentRequiredListener = listener
}

function notifyAuthLifecycle(error: ApiClientError): void {
  if (error.isUnauthenticated()) {
    unauthorizedListener?.(error)
  } else if (error.isConsentRequired()) {
    consentRequiredListener?.(error)
  }
}

export function normalizeErrorCode(rawCode: unknown, status: number): ApiErrorCode {
  if (typeof rawCode === 'string' && KNOWN_ERROR_CODE_SET.has(rawCode)) {
    return rawCode as ApiErrorCode
  }
  switch (status) {
    case 400:
      return 'validation_error'
    case 401:
      return 'unauthenticated'
    case 403:
      return 'forbidden'
    case 404:
      return 'not_found'
    case 413:
      return 'too_large'
    case 415:
      return 'unsupported_type'
    case 429:
      return 'rate_limited'
    default:
      return 'unknown_error'
  }
}

export function parseApiErrorFromBody(
  status: number,
  rawText: string,
  fallbackMessage?: string,
): ApiClientError {
  if (!rawText.trim()) {
    return new ApiClientError({
      status,
      code: normalizeErrorCode(undefined, status),
      message: fallbackMessage ?? `Permintaan gagal (HTTP ${status})`,
    })
  }

  try {
    const parsed: unknown = JSON.parse(rawText)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'error' in parsed &&
      typeof parsed.error === 'object' &&
      parsed.error !== null
    ) {
      const errObj = parsed.error as Record<string, unknown>
      const code = normalizeErrorCode(errObj.code, status)
      const message =
        typeof errObj.message === 'string' && errObj.message.length > 0
          ? errObj.message
          : (fallbackMessage ?? `Permintaan gagal (HTTP ${status})`)
      const details =
        typeof errObj.details === 'object' && errObj.details !== null
          ? (errObj.details as ApiErrorDetails)
          : null

      return new ApiClientError({
        status,
        code,
        message,
        details,
      })
    }
  } catch {
    return new ApiClientError({
      status,
      code: status >= 500 ? normalizeErrorCode(undefined, status) : 'parse_error',
      message: fallbackMessage ?? `Respons server tidak valid (HTTP ${status})`,
    })
  }

  return new ApiClientError({
    status,
    code: normalizeErrorCode(undefined, status),
    message: fallbackMessage ?? `Permintaan gagal (HTTP ${status})`,
  })
}

export type QueryParamValue = string | number | boolean | null | undefined

export function buildQueryString(params?: Record<string, QueryParamValue>): string {
  if (!params) {
    return ''
  }
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }
  const serialized = searchParams.toString()
  return serialized ? `?${serialized}` : ''
}

export interface FetchApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, QueryParamValue>
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * Cookie-based JSON HTTP client.
 * - Always sends `credentials: 'include'` so HttpOnly JWT cookies accompany requests.
 * - Automatically attaches `X-CSRF-TOKEN` from cookie `csrf_access_token` on mutating methods.
 */
export async function fetchApi<TResponse>(
  path: string,
  options: FetchApiOptions = {},
): Promise<TResponse> {
  const method = options.method ?? 'GET'
  const url = `${buildApiUrl(path)}${buildQueryString(options.query)}`

  const headers = new Headers(options.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (requiresCsrfHeader(method) && !headers.has(CSRF_HEADER_NAME)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers.set(CSRF_HEADER_NAME, csrfToken)
    }
  }

  let serializedBody: BodyInit | undefined
  if (options.body !== undefined) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    serializedBody = JSON.stringify(options.body)
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: serializedBody,
      credentials: 'include',
      signal: options.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiClientError({
        status: 0,
        code: 'aborted',
        message: 'Permintaan dibatalkan',
      })
    }
    throw new ApiClientError({
      status: 0,
      code: 'network_error',
      message: 'Gagal terhubung ke server. Periksa koneksi jaringan Anda.',
    })
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  const rawText = await response.text()

  if (!response.ok) {
    const apiError = parseApiErrorFromBody(response.status, rawText)
    notifyAuthLifecycle(apiError)
    throw apiError
  }

  if (!rawText.trim()) {
    return undefined as TResponse
  }

  try {
    return JSON.parse(rawText) as TResponse
  } catch {
    throw new ApiClientError({
      status: response.status,
      code: 'parse_error',
      message: 'Format JSON respons server tidak valid',
    })
  }
}

export interface UploadFileOptions {
  filename?: string
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

/**
 * Raw binary stream upload client using `XMLHttpRequest` for upload progress events.
 * Sends raw bytes (`Content-Type: application/octet-stream`), `X-Filename`, and `X-CSRF-TOKEN`
 * with `withCredentials = true`—never `multipart/form-data`—preventing plaintext temp files on disk.
 */
export function uploadFileWithProgress<TResponse>(
  path: string,
  file: Blob | File,
  options: UploadFileOptions = {},
): Promise<TResponse> {
  return new Promise<TResponse>((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(
        new ApiClientError({
          status: 0,
          code: 'aborted',
          message: 'Unggahan dibatalkan',
        }),
      )
      return
    }

    const xhr = new XMLHttpRequest()
    const url = buildApiUrl(path)
    const rawFilename =
      options.filename ?? (file instanceof File && file.name ? file.name : 'upload.bin')

    xhr.open('POST', url, true)
    xhr.withCredentials = true
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.setRequestHeader('X-Filename', encodeURIComponent(rawFilename))

    const csrfToken = getCsrfToken()
    if (csrfToken) {
      xhr.setRequestHeader(CSRF_HEADER_NAME, csrfToken)
    }

    const handleAbortSignal = () => {
      xhr.abort()
    }
    options.signal?.addEventListener('abort', handleAbortSignal, { once: true })

    const cleanup = () => {
      options.signal?.removeEventListener('abort', handleAbortSignal)
    }

    if (xhr.upload && options.onProgress) {
      xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
        const computable = event.lengthComputable && event.total > 0
        const fraction = computable ? Math.min(1, event.loaded / event.total) : null
        const percent = fraction !== null ? Math.round(fraction * 100) : null
        options.onProgress?.({
          loaded: event.loaded,
          total: event.total,
          fraction,
          percent,
        })
      }
    }

    xhr.onload = () => {
      cleanup()
      const rawText = xhr.responseText ?? ''

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = JSON.parse(rawText) as TResponse
          resolve(parsed)
        } catch {
          reject(
            new ApiClientError({
              status: xhr.status,
              code: 'parse_error',
              message: 'Respons unggahan tidak dapat dibaca',
            }),
          )
        }
        return
      }

      const apiError = parseApiErrorFromBody(xhr.status, rawText)
      notifyAuthLifecycle(apiError)
      reject(apiError)
    }

    xhr.onerror = () => {
      cleanup()
      reject(
        new ApiClientError({
          status: 0,
          code: 'network_error',
          message: 'Gagal mengunggah file karena gangguan jaringan',
        }),
      )
    }

    xhr.onabort = () => {
      cleanup()
      reject(
        new ApiClientError({
          status: 0,
          code: 'aborted',
          message: 'Unggahan dibatalkan',
        }),
      )
    }

    xhr.send(file)
  })
}

export function extractFilenameFromContentDisposition(
  contentDisposition: string | null,
): string | null {
  if (!contentDisposition) {
    return null
  }

  const utf8Match = /filename\*=UTF-8''([^;\s]+)/i.exec(contentDisposition)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }

  const quotedMatch = /filename="([^"]+)"/i.exec(contentDisposition)
  if (quotedMatch?.[1]) {
    return quotedMatch[1]
  }

  const bareMatch = /filename=([^;\s]+)/i.exec(contentDisposition)
  if (bareMatch?.[1]) {
    return bareMatch[1]
  }

  return null
}

export interface FetchItemBlobOptions {
  download?: boolean
  signal?: AbortSignal
}

/**
 * Fetches an encrypted item in full as a verified `Blob` (`GET /api/items/{item_id}`).
 * Server verifies all 3 ciphertexts' HMACs and full chunk equality before completing response.
 */
export async function fetchItemBlob(
  itemId: string,
  options: FetchItemBlobOptions = {},
): Promise<FetchedItemBlob> {
  const query: GetItemQueryParams = options.download ? { download: 1 } : {}
  const url = `${buildApiUrl(`/api/items/${encodeURIComponent(itemId)}`)}${buildQueryString(
    query as Record<string, QueryParamValue>,
  )}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      signal: options.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiClientError({
        status: 0,
        code: 'aborted',
        message: 'Unduhan file dibatalkan',
      })
    }
    throw new ApiClientError({
      status: 0,
      code: 'network_error',
      message: 'Gagal mengunduh file dari server',
    })
  }

  if (!response.ok) {
    const rawText = await response.text()
    const apiError = parseApiErrorFromBody(response.status, rawText)
    notifyAuthLifecycle(apiError)
    throw apiError
  }

  const blob = await response.blob()
  const contentDisposition = response.headers.get('Content-Disposition')
  const contentType =
    response.headers.get('Content-Type') || blob.type || 'application/octet-stream'

  return {
    blob,
    content_type: contentType,
    size_bytes: blob.size,
    filename: extractFilenameFromContentDisposition(contentDisposition),
    content_disposition: contentDisposition,
  }
}
