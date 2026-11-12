import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'

const MINIMAL_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF',
  'utf-8',
)

test.describe('Phase 2 Encrypted Profile & Document Manager E2E', () => {
  test('enforces re-verification confirmation on sensitive profile edit and supports document replace, inline preview, and ?download=1', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByLabel('Email', { exact: true }).fill('terverifikasi@mahasiswa.ac.id')
    await page.getByLabel('Password', { exact: true }).fill('rahasia-panjang-123')
    await page.getByRole('button', { name: 'Masuk', exact: true }).click()

    await expect(page).toHaveURL('/dashboard')

    // 1. Navigate to /profile and trigger re-verification confirmation prompt
    await page.getByRole('link', { name: 'Profile', exact: true }).click()
    await expect(page).toHaveURL('/profile')
    await expect(page.getByTestId('profile-verification-badge')).toHaveText('Terverifikasi')

    const institutionInput = page.getByLabel(/Institusi/i)
    await institutionInput.fill('Institut Teknologi Bandung')
    await page.getByRole('button', { name: /Simpan Profil/i }).click()

    const confirmDialog = page.getByTestId('reverify-confirm-dialog')
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole('button', { name: /Ya, Simpan & Verifikasi Ulang/i }).click()

    await expect(page.getByTestId('profile-verification-badge')).toHaveText(
      'Menunggu Verifikasi',
    )

    // 2. Navigate to /documents, replace KTM with raw XHR PDF upload, preview inline, and download
    await page.getByRole('link', { name: 'Documents', exact: true }).click()
    await expect(page).toHaveURL('/documents')

    await page.getByTestId('file-input-ktm').setInputFiles({
      name: 'ktm-baru-itb.pdf',
      mimeType: 'application/pdf',
      buffer: MINIMAL_PDF_BUFFER,
    })

    await expect(page.getByTestId('doc-success-ktm')).toContainText('ktm-baru-itb.pdf')

    // Open inline Blob preview
    await page.getByTestId('doc-preview-btn-ktp').click()
    const previewModal = page.getByTestId('document-preview-modal')
    await expect(previewModal).toBeVisible()
    await expect(previewModal.getByTestId('preview-image')).toBeVisible()
    await previewModal.getByRole('button', { name: /Tutup pratinjau/i }).click()
    await expect(previewModal).toBeHidden()

    // Trigger authenticated file download (?download=1)
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('doc-download-btn-ktm').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('ktm-baru-itb.pdf')
  })
})
