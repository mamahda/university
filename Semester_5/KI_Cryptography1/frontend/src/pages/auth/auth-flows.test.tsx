import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import DemoOne from '@/components/ui/demo'
import { setMockPolicyVersion } from '../../mocks/handlers'
import { AppRoutes } from '../../router'
import { useAuthStore } from '../../stores/authStore'
import { renderWithProviders } from '../../test/test-utils'

describe('Authentication, Explicit Privacy Consent & Route Guards', () => {
  it('guards protected routes by redirecting unauthenticated users to /login and restores target route on login', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/documents'] },
    })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^LOGIN$/i }),
      ).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/Email/i), 'budi@mahasiswa.ac.id')
    await user.type(screen.getByLabelText(/^Password$/i), 'rahasia-panjang-123')
    await user.click(screen.getByRole('button', { name: /^Masuk$/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^DOKUMEN$/ })).toBeInTheDocument()
    })
    expect(screen.getByTestId('session-badge')).toHaveTextContent(
      'budi@mahasiswa.ac.id (peserta)',
    )
  })

  it('shows 401 invalid_credentials error message when login fails', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/login'] },
    })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^LOGIN$/i }),
      ).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/Email/i), 'budi@mahasiswa.ac.id')
    await user.type(screen.getByLabelText(/^Password$/i), 'salah-password')
    await user.click(screen.getByRole('button', { name: /^Masuk$/i }))

    await waitFor(() => {
      expect(screen.getByTestId('login-error-alert')).toHaveTextContent(
        /Email atau password salah/i,
      )
    })
  })

  it('validates registration inputs, handles 409 email_taken, and gates new peserta through /consent', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/register'] },
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^REGISTRASI$/i })).toBeInTheDocument()
    })

    // Password too short (< 10 chars)
    await user.type(screen.getByLabelText(/Email Mahasiswa/i), 'peserta.baru@kampus.ac.id')
    await user.type(screen.getByLabelText(/Password \(minimal 10 karakter\)/i), 'pendek')
    await user.type(screen.getByLabelText(/Konfirmasi Password/i), 'pendek')
    await user.click(screen.getByRole('button', { name: /Daftar & Masuk/i }))
    expect(screen.getByText(/Password minimal 10 karakter/i)).toBeInTheDocument()

    // Duplicate email -> 409 email_taken
    await user.clear(screen.getByLabelText(/Email Mahasiswa/i))
    await user.type(screen.getByLabelText(/Email Mahasiswa/i), 'budi@mahasiswa.ac.id')
    await user.clear(screen.getByLabelText(/Password \(minimal 10 karakter\)/i))
    await user.type(
      screen.getByLabelText(/Password \(minimal 10 karakter\)/i),
      'rahasia-panjang-123',
    )
    await user.clear(screen.getByLabelText(/Konfirmasi Password/i))
    await user.type(screen.getByLabelText(/Konfirmasi Password/i), 'rahasia-panjang-123')
    await user.click(screen.getByRole('button', { name: /Daftar & Masuk/i }))

    await waitFor(() => {
      expect(screen.getByTestId('register-error-alert')).toHaveTextContent(
        /Email sudah terdaftar/i,
      )
    })

    // Valid new registration -> auto-login -> redirected to /consent
    await user.clear(screen.getByLabelText(/Email Mahasiswa/i))
    await user.type(screen.getByLabelText(/Email Mahasiswa/i), 'peserta.baru@kampus.ac.id')
    await user.click(screen.getByRole('button', { name: /Daftar & Masuk/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Pemberitahuan Privasi & Persetujuan Eksplisit/i }),
      ).toBeInTheDocument()
    })

    // Button disabled until checkbox is checked (wait for GET /api/policy to resolve)
    const submitConsentBtn = await screen.findByRole('button', {
      name: /Setujui & Lanjutkan ke Pendaftaran/i,
    })
    expect(submitConsentBtn).toBeDisabled()

    await user.click(screen.getByRole('checkbox'))
    expect(submitConsentBtn).toBeEnabled()
    await user.click(submitConsentBtn)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^Ruang Peserta$/ })).toBeInTheDocument()
    })
  })

  it('recovers from 409 policy_outdated by reloading the latest policy version and requiring re-confirmation', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/login'] },
    })

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^LOGIN$/i }),
      ).toBeInTheDocument()
    })

    // Login as unconsented participant
    await user.type(screen.getByLabelText(/Email/i), 'baru@mahasiswa.ac.id')
    await user.type(screen.getByLabelText(/^Password$/i), 'rahasia-panjang-123')
    await user.click(screen.getByRole('button', { name: /^Masuk$/i }))

    await waitFor(() => {
      expect(screen.getByTestId('policy-version-badge')).toHaveTextContent('Versi 1.0')
    })

    // Simulate backend bumping privacy policy version to 2.0 while user is viewing 1.0
    setMockPolicyVersion(
      '2.0',
      '## Pemberitahuan Privasi Versi 2.0\n- Pembaruan ketentuan pelindungan data peserta.',
    )

    await user.click(screen.getByRole('checkbox'))
    await user.click(
      screen.getByRole('button', { name: /Setujui & Lanjutkan ke Pendaftaran/i }),
    )

    // Expect 409 policy_outdated alert, unchecked checkbox, and reloaded v2.0 policy
    await waitFor(() => {
      expect(screen.getByTestId('policy-outdated-alert')).toBeInTheDocument()
      expect(screen.getByTestId('policy-version-badge')).toHaveTextContent('Versi 2.0')
    })

    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByTestId('policy-markdown-box')).toHaveTextContent(
      'Pemberitahuan Privasi Versi 2.0',
    )

    // Re-check and submit v2.0 -> succeeds and navigates to /dashboard
    await user.click(screen.getByRole('checkbox'))
    await user.click(
      screen.getByRole('button', { name: /Setujui & Lanjutkan ke Pendaftaran/i }),
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^Ruang Peserta$/ })).toBeInTheDocument()
    })
  })

  it('enforces RoleGuard (blocks peserta from admin/juri routes) and logs out cleanly with CSRF', async () => {
    const user = userEvent.setup()

    useAuthStore.getState().setSessionUser({
      id: 'b1a7c2d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d',
      email: 'budi@mahasiswa.ac.id',
      role: 'peserta',
      full_name: 'Budi Santoso',
      verification_status: 'menunggu',
      consent: {
        policy_version: '1.0',
        agreed_at: '2026-10-26T09:00:00+07:00',
      },
      current_policy_version: '1.0',
      team: null,
    })

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/admin/participants'] },
    })

    expect(screen.getByTestId('role-forbidden')).toHaveTextContent('403 — Akses Ditolak')

    await user.click(screen.getByRole('button', { name: /Keluar/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /^LOGIN$/i }),
      ).toBeInTheDocument()
    })
    // The auth screens carry no bar, so there is no badge; the store is the proof.
    expect(screen.queryByTestId('session-badge')).not.toBeInTheDocument()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('renders standalone shadcn ModernLoginSignup via DemoOne and toggles login/register modes', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().clearSession()

    renderWithProviders(<DemoOne />)

    expect(
      screen.getByRole('heading', { name: /^LOGIN$/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Daftar sekarang/i }))
    expect(screen.getByRole('heading', { name: /^REGISTRASI$/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Masuk di sini/i }))
    expect(
      screen.getByRole('heading', { name: /^LOGIN$/i }),
    ).toBeInTheDocument()
  })
})
