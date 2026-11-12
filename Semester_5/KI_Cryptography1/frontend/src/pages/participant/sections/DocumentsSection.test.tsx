import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { detectMagicMimeFromBytes, validateDocumentFile } from '@/lib/fileValidation'
import { seedMockActiveSession, tamperMockItem } from '@/mocks/handlers'
import { AppRoutes } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { renderWithProviders } from '@/test/test-utils'

const VALID_PNG_HEADER = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
])
const VALID_JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])
const VALID_PDF_HEADER = new TextEncoder().encode('%PDF-1.7\n1 0 obj\n%%EOF')

describe('fileValidation (magic-byte + MIME + 5 MB rules)', () => {
  it('identifies JPEG, PNG, and PDF from leading magic bytes', () => {
    expect(detectMagicMimeFromBytes(VALID_JPEG_HEADER)).toBe('image/jpeg')
    expect(detectMagicMimeFromBytes(VALID_PNG_HEADER)).toBe('image/png')
    expect(detectMagicMimeFromBytes(VALID_PDF_HEADER)).toBe('application/pdf')
    expect(detectMagicMimeFromBytes(new Uint8Array([0x4d, 0x5a, 0x90, 0x00]))).toBeNull()
  })

  it('rejects spoofed magic bytes, mismatched MIME headers, empty files, and > 5 MB files', async () => {
    const emptyFile = new File([], 'kosong.pdf', { type: 'application/pdf' })
    expect((await validateDocumentFile(emptyFile)).valid).toBe(false)

    const spoofedExeAsJpg = new File(
      [new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00])],
      'ktp-palsu.jpg',
      { type: 'image/jpeg' },
    )
    const spoofResult = await validateDocumentFile(spoofedExeAsJpg)
    expect(spoofResult.valid).toBe(false)
    expect(spoofResult.errorMessage).toMatch(/magic bytes/i)

    const mismatchedMime = new File([VALID_PNG_HEADER], 'dokumen.pdf', {
      type: 'application/pdf',
    })
    const mismatchResult = await validateDocumentFile(mismatchedMime)
    expect(mismatchResult.valid).toBe(false)
    expect(mismatchResult.errorMessage).toMatch(/tidak cocok/i)

    const oversized = new File([VALID_PDF_HEADER], 'besar.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(oversized, 'size', { value: 5_242_881 })
    const oversizeResult = await validateDocumentFile(oversized, 5_242_880)
    expect(oversizeResult.valid).toBe(false)
    expect(oversizeResult.errorMessage).toMatch(/melebihi batas maksimal/i)

    const validPdf = new File([VALID_PDF_HEADER], 'ktm-asli.pdf', {
      type: 'application/pdf',
    })
    expect(await validateDocumentFile(validPdf)).toEqual({
      valid: true,
      detectedMime: 'application/pdf',
      errorMessage: null,
    })
  })
})

describe('DocumentManagerPage (/documents)', () => {
  it('blocks spoofed magic-byte uploads client-side and replaces an existing document via XHR raw stream', async () => {
    const sessionUser = seedMockActiveSession('ditolak@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/dashboard'] },
    })

    const ktmCard = await screen.findByTestId('document-card-ktm')
    expect(within(ktmCard).getByText('ktm-rina-blur.jpg')).toBeInTheDocument()
    expect(await screen.findByTestId('documents-verification-badge')).toHaveTextContent('Ditolak')

    // 1. Attempt spoofed file upload -> rejected by client-side magic-byte check
    const ktmInput = screen.getByTestId('file-input-ktm')
    const spoofedFile = new File([new TextEncoder().encode('NOT_A_REAL_PDF')], 'fake.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(ktmInput, { target: { files: [spoofedFile] } })

    expect(await screen.findByTestId('doc-error-ktm')).toHaveTextContent(/magic bytes/i)

    // 2. Replace KTM with a valid PDF -> XHR upload succeeds and recovers ditolak -> Menunggu Verifikasi
    const validKtmPdf = new File([VALID_PDF_HEADER], 'ktm-rina-jelas.pdf', {
      type: 'application/pdf',
    })
    fireEvent.change(ktmInput, { target: { files: [validKtmPdf] } })

    expect(await screen.findByTestId('doc-success-ktm')).toHaveTextContent(
      /ktm-rina-jelas\.pdf/i,
    )
    expect(await within(ktmCard).findByText('ktm-rina-jelas.pdf')).toBeInTheDocument()
    expect(await screen.findByTestId('documents-verification-badge')).toHaveTextContent(
      'Menunggu Verifikasi',
    )
  })

  it('previews image & PDF blobs inline, revokes Object URL on close, and downloads with ?download=1', async () => {
    const user = userEvent.setup()
    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    const createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => 'blob:http://localhost:5173/mock-preview-blob')
    const revokeObjectUrlSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    try {
      renderWithProviders(<AppRoutes />, {
        routerProps: { initialEntries: ['/dashboard'] },
      })

      // 1. Preview JPEG KTP -> renders <img> inside modal
      const ktpPreviewBtn = await screen.findByTestId('doc-preview-btn-ktp')
      await user.click(ktpPreviewBtn)

      const modal = await screen.findByTestId('document-preview-modal')
      const previewImg = await within(modal).findByTestId('preview-image')
      expect(previewImg).toHaveAttribute('src', 'blob:http://localhost:5173/mock-preview-blob')

      await user.click(within(modal).getByRole('button', { name: /Tutup pratinjau/i }))
      expect(screen.queryByTestId('document-preview-modal')).not.toBeInTheDocument()
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith(
        'blob:http://localhost:5173/mock-preview-blob',
      )

      // 2. Preview PDF KTM -> renders <iframe> inside modal
      await user.click(screen.getByTestId('doc-preview-btn-ktm'))
      const pdfModal = await screen.findByTestId('document-preview-modal')
      expect(await within(pdfModal).findByTestId('preview-pdf-iframe')).toBeInTheDocument()
      await user.click(within(pdfModal).getByRole('button', { name: /Tutup pratinjau/i }))

      // 3. Authenticated download (?download=1)
      await user.click(screen.getByTestId('doc-download-btn-twibbon'))
      await waitFor(() => {
        expect(anchorClickSpy).toHaveBeenCalled()
      })

      const downloadCall = fetchSpy.mock.calls.find(([input]) =>
        String(input).includes('5b8e3a4c-0d6f-4e3b-9a9c-4d7f0e2b3c15?download=1'),
      )
      expect(downloadCall).toBeDefined()
      expect((downloadCall?.[1] as RequestInit | undefined)?.credentials).toBe('include')
    } finally {
      createObjectUrlSpy.mockRestore()
      revokeObjectUrlSpy.mockRestore()
      fetchSpy.mockRestore()
      anchorClickSpy.mockRestore()
    }
  })

  it('surfaces 500 integrity_error inside preview modal when server detects tampered ciphertext', async () => {
    const user = userEvent.setup()
    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)
    tamperMockItem('3f6c1e2a-8b4d-4c1f-9e7a-2b5d8c0f1a93', true)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/dashboard'] },
    })

    await user.click(await screen.findByTestId('doc-preview-btn-ktp'))

    const errorAlert = await screen.findByTestId('document-preview-error')
    expect(
      within(errorAlert).getByText(/Kegagalan Integritas Kriptografi \(500 integrity_error\)/i),
    ).toBeInTheDocument()
    expect(within(errorAlert).getByText(/HMAC atau pencocokan tiga cipher gagal/i)).toBeInTheDocument()
  })
})
