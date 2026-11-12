import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { seedMockActiveSession } from '../mocks/handlers'
import { server } from '../mocks/server'
import {
  apiClient,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  extractFilenameFromContentDisposition,
  fetchApi,
  getCookie,
  isApiClientError,
  requiresCsrfHeader,
  setConsentRequiredListener,
  setUnauthorizedListener,
  uploadFileWithProgress,
  type UploadDocumentResponse,
  type UploadProgress,
} from './index'

describe('Cookie-Based Fetch Client, CSRF & Raw Stream Upload', () => {
  it('reads cookies accurately and identifies mutating HTTP methods for CSRF', () => {
    const cookieStr = `other=123; ${CSRF_COOKIE_NAME}=${encodeURIComponent('tok/abc=1')}; theme=light`
    expect(getCookie(CSRF_COOKIE_NAME, cookieStr)).toBe('tok/abc=1')
    expect(getCookie('missing', cookieStr)).toBeNull()

    expect(requiresCsrfHeader('GET')).toBe(false)
    expect(requiresCsrfHeader('POST')).toBe(true)
    expect(requiresCsrfHeader('PUT')).toBe(true)
    expect(requiresCsrfHeader('PATCH')).toBe(true)
    expect(requiresCsrfHeader('DELETE')).toBe(true)
  })

  it('sends credentials: include and automatically injects X-CSRF-TOKEN on mutating requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    let capturedCsrfHeader: string | null = null

    document.cookie = `${CSRF_COOKIE_NAME}=csrf-secret-xyz; Path=/`

    server.use(
      http.put('*/api/profile', ({ request }) => {
        capturedCsrfHeader = request.headers.get(CSRF_HEADER_NAME)
        return HttpResponse.json({ ok: true }, { status: 200 })
      }),
    )

    const result = await fetchApi<{ ok: boolean }>('/api/profile', {
      method: 'PUT',
      body: { full_name: 'Budi' },
    })

    expect(result.ok).toBe(true)
    expect(fetchSpy.mock.calls[0]?.[1]?.credentials).toBe('include')
    expect(capturedCsrfHeader).toBe('csrf-secret-xyz')
    fetchSpy.mockRestore()
  })

  it('notifies unauthorized listener on 401 unauthenticated, but NOT on 401 invalid_credentials', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedListener(onUnauthorized)

    await expect(
      apiClient.auth.login({
        email: 'budi@mahasiswa.ac.id',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'invalid_credentials',
    })
    expect(onUnauthorized).not.toHaveBeenCalled()

    await expect(apiClient.auth.getMe()).rejects.toMatchObject({
      status: 401,
      code: 'unauthenticated',
    })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)

    setUnauthorizedListener(null)
  })

  it('notifies consentRequired listener when protected endpoint returns 403 consent_required', async () => {
    const onConsentRequired = vi.fn()
    setConsentRequiredListener(onConsentRequired)
    seedMockActiveSession('baru@mahasiswa.ac.id', 'csrf-consent-check')

    const samplePdf = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'ktp saya.pdf', {
      type: 'application/pdf',
    })

    await expect(apiClient.documents.upload('ktp', samplePdf)).rejects.toMatchObject({
      status: 403,
      code: 'consent_required',
    })
    expect(onConsentRequired).toHaveBeenCalledTimes(1)

    setConsentRequiredListener(null)
  })

  it('uploads raw binary stream via XMLHttpRequest with application/octet-stream, X-Filename, X-CSRF-TOKEN, and progress events', async () => {
    seedMockActiveSession('budi@mahasiswa.ac.id', 'csrf-upload-123')

    let receivedContentType: string | null = null
    let receivedFilenameHeader: string | null = null
    let receivedCsrfHeader: string | null = null
    let receivedByteLength = 0

    server.use(
      http.post('*/api/documents/ktp', async ({ request }) => {
        receivedContentType = request.headers.get('Content-Type')
        receivedFilenameHeader = request.headers.get('X-Filename')
        receivedCsrfHeader = request.headers.get(CSRF_HEADER_NAME)
        const buffer = await request.arrayBuffer()
        receivedByteLength = buffer.byteLength

        return HttpResponse.json(
          {
            item_id: '3f6c1e2a-8b4d-4c1f-9e7a-2b5d8c0f1a93',
            field: 'ktp',
            content_type: 'image/jpeg',
            size_bytes: receivedByteLength,
            original_filename: decodeURIComponent(receivedFilenameHeader ?? ''),
            uploaded_at: '2026-10-27T10:00:00+07:00',
            verification_status: 'menunggu',
          } satisfies UploadDocumentResponse,
          { status: 201 },
        )
      }),
    )

    const payload = new Uint8Array(2048).fill(0xab)
    const file = new File([payload], 'ktp budi (scan).jpg', { type: 'image/jpeg' })
    const progressEvents: UploadProgress[] = []

    const response = await uploadFileWithProgress<UploadDocumentResponse>(
      '/api/documents/ktp',
      file,
      {
        onProgress: (p) => progressEvents.push(p),
      },
    )

    expect(receivedContentType).toBe('application/octet-stream')
    expect(receivedFilenameHeader).toBe(encodeURIComponent('ktp budi (scan).jpg'))
    expect(receivedCsrfHeader).toBe('csrf-upload-123')
    expect(receivedByteLength).toBe(2048)
    expect(response.original_filename).toBe('ktp budi (scan).jpg')
    expect(response.size_bytes).toBe(2048)
    expect(progressEvents.length).toBeGreaterThanOrEqual(0)
  })

  it('supports AbortSignal cancellation on uploadFileWithProgress', async () => {
    const controller = new AbortController()
    controller.abort()

    const file = new File([new Uint8Array([1, 2, 3])], 'test.pdf', { type: 'application/pdf' })
    try {
      await uploadFileWithProgress('/api/documents/ktp', file, { signal: controller.signal })
      expect.unreachable('Expected aborted upload to reject')
    } catch (err) {
      expect(isApiClientError(err)).toBe(true)
      if (isApiClientError(err)) {
        expect(err.code).toBe('aborted')
      }
    }
  })

  it('extracts UTF-8 filenames from Content-Disposition and surfaces 500 integrity_error on tampered items', async () => {
    expect(
      extractFilenameFromContentDisposition("attachment; filename*=UTF-8''proposal%20tim.pdf"),
    ).toBe('proposal tim.pdf')
    expect(extractFilenameFromContentDisposition('inline; filename="demo.mp4"')).toBe('demo.mp4')

    server.use(
      http.get('*/api/items/:itemId', () => {
        return HttpResponse.json(
          {
            error: {
              code: 'integrity_error',
              message: 'Verifikasi HMAC gagal pada salah satu ciphertext',
              details: {},
            },
          },
          { status: 500 },
        )
      }),
    )

    await expect(apiClient.items.getBlob('tampered-item-id')).rejects.toMatchObject({
      status: 500,
      code: 'integrity_error',
    })
  })
})
