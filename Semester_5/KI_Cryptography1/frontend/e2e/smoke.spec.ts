import { expect, test } from '@playwright/test'

test.describe('Phase 0 & 1 Frontend Smoke & Route Guard E2E', () => {
  test('boots app in opt-in MSW mode, loads settings, and enforces login guard on protected routes', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Platform Pendaftaran Schematics NIC' }),
    ).toBeVisible()
    await expect(page.getByTestId('settings-summary')).toContainText('2–4 members')
    await expect(page.getByTestId('settings-summary')).toContainText('100 MB')

    // Navigating directly to a protected route redirects unauthenticated visitors to /login
    await page.goto('/admin/benchmarks')
    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { name: 'Masuk ke Schematics NIC' }),
    ).toBeVisible()

    // Logging in as superadmin grants access to Anggota D's /admin/benchmarks route
    await page.getByLabel('Email').fill('admin@panitia.id')
    await page.getByLabel('Password', { exact: true }).fill('superadmin-12345')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL(/\/admin\/benchmarks$/)
    await expect(
      page.getByRole('heading', { name: 'Cipher Benchmark Dashboard' }),
    ).toBeVisible()
  })
})
