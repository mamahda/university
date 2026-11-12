import { expect, test } from '@playwright/test'

test.describe('Phase 1 Authentication & Explicit Privacy Consent E2E', () => {
  test('registers a new participant, enforces explicit UU PDP consent gate, reaches dashboard, and logs out', async ({
    page,
  }) => {
    await page.goto('/register')

    const uniqueEmail = `peserta.${Date.now()}@mahasiswa.ac.id`
    await page.getByLabel('Email Mahasiswa').fill(uniqueEmail)
    await page.getByLabel('Password (minimal 10 karakter)').fill('rahasia-kuat-12345')
    await page.getByLabel('Konfirmasi Password').fill('rahasia-kuat-12345')
    await page.getByRole('button', { name: 'Daftar & Masuk' }).click()

    // Newly registered peserta must consent before accessing /dashboard
    await expect(page).toHaveURL(/\/consent$/)
    await expect(
      page.getByRole('heading', { name: /Pemberitahuan Privasi & Persetujuan Eksplisit/i }),
    ).toBeVisible()
    await expect(page.getByTestId('policy-version-badge')).toContainText('Versi 1.0')

    const acceptButton = page.getByRole('button', {
      name: 'Setujui & Lanjutkan ke Pendaftaran',
    })
    await expect(acceptButton).toBeDisabled()

    await page.getByRole('checkbox').check()
    await expect(acceptButton).toBeEnabled()
    await acceptButton.click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByRole('heading', { name: 'Participant Dashboard' }),
    ).toBeVisible()
    await expect(page.getByTestId('session-badge')).toContainText(`${uniqueEmail} (peserta)`)

    // Logout clears session and returns to /login
    await page.getByRole('button', { name: 'Keluar' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByTestId('session-badge')).toContainText('Guest')
  })

  test('displays auth error on invalid credentials and redirects consented participant to dashboard on valid login', async ({
    page,
  }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('budi@mahasiswa.ac.id')
    await page.getByLabel('Password', { exact: true }).fill('wrong-password-999')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page.getByTestId('login-error-alert')).toContainText(
      'Email atau password salah',
    )

    await page.getByLabel('Password', { exact: true }).fill('rahasia-panjang-123')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByRole('heading', { name: 'Participant Dashboard' }),
    ).toBeVisible()
  })
})
