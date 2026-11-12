import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { seedMockActiveSession } from './mocks/handlers'
import { AppRoutes } from './router'
import { useAuthStore } from './stores/authStore'
import { useUiStore } from './stores/uiStore'
import { renderWithProviders } from './test/test-utils'

describe('Application Shell & Core Routing', () => {
  it('fetches competition settings via TanStack Query + MSW and renders limits', async () => {
    useAuthStore.getState().clearSession()

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/'] },
    })

    expect(
      screen.getByRole('heading', { name: /Platform Pendaftaran Schematics NIC/i }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('settings-summary')).toBeInTheDocument()
    })

    expect(screen.getByText('2–4 anggota')).toBeInTheDocument()
    expect(screen.getByText('5 MB / 10 MB')).toBeInTheDocument()
    expect(screen.getByText('100 MB')).toBeInTheDocument()
  })

  it('navigates across superadmin routes', async () => {
    const user = userEvent.setup()
    // The superadmin endpoints are session-gated, so the mock server needs a
    // real session: a store-only user answers 401 and gets logged straight out.
    useAuthStore.getState().setSessionUser(seedMockActiveSession('admin@panitia.id')!)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/admin/benchmarks'] },
    })

    expect(
      screen.getByRole('heading', { name: /Cipher Benchmark Dashboard/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: /Encryption Inspector/i }))
    expect(
      screen.getByRole('heading', { name: /Encryption & Integrity Inspector/i }),
    ).toBeInTheDocument()
  })

  it('reflects Zustand auth and UI notice state in the application shell', async () => {
    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)
    useUiStore.getState().pushNotice({
      variant: 'info',
      message: 'Session hydrated',
    })

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/dashboard'] },
    })

    expect(screen.getByTestId('session-badge')).toHaveTextContent(
      'budi@mahasiswa.ac.id (peserta)',
    )
    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument()
    })
    expect(screen.getByRole('status')).toHaveTextContent('Session hydrated')
    expect(screen.getByTestId('verification-status-card')).toBeInTheDocument()
  })
})
