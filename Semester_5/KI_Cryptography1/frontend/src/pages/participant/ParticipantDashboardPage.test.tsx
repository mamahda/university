import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { computeCountdown } from '@/lib/countdown'
import { DEFAULT_MOCK_SETTINGS, seedMockActiveSession } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { AppRoutes } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { renderWithProviders } from '@/test/test-utils'

describe('computeCountdown helper', () => {
  it('calculates remaining days, hours, minutes, and seconds before deadline', () => {
    const nowMs = Date.parse('2026-11-18T10:00:00Z')
    const deadlineIso = '2026-11-20T13:05:09Z'

    const snapshot = computeCountdown(deadlineIso, nowMs)
    expect(snapshot).toEqual({
      expired: false,
      totalRemainingMs: (2 * 86_400 + 3 * 3600 + 5 * 60 + 9) * 1000,
      days: 2,
      hours: 3,
      minutes: 5,
      seconds: 9,
    })
  })

  it('marks countdown as expired with zeroed units once deadline has passed', () => {
    const nowMs = Date.parse('2026-12-10T00:00:00Z')
    const snapshot = computeCountdown('2026-12-05T23:59:00Z', nowMs)

    expect(snapshot).toEqual({
      expired: true,
      totalRemainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })

  it('returns null for malformed date strings', () => {
    expect(computeCountdown('bukan-tanggal')).toBeNull()
  })
})

describe('ParticipantDashboardPage', () => {
  it('renders deadline countdowns, dual status cards (menunggu + draft team), and every submission section', async () => {
    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/dashboard'] },
    })

    expect(
      screen.getByRole('heading', { name: /^Ruang Peserta$/ }),
    ).toBeInTheDocument()

    const regCard = await screen.findByTestId('registration-countdown-card')
    const subCard = await screen.findByTestId('submission-countdown-card')
    expect(within(regCard).getByText(/Tenggat Pendaftaran Peserta/i)).toBeInTheDocument()
    expect(within(subCard).getByText(/Tenggat Pengumpulan Karya/i)).toBeInTheDocument()

    const verificationCard = await screen.findByTestId('verification-status-card')
    expect(await within(verificationCard).findByText('Menunggu Verifikasi')).toBeInTheDocument()
    expect(await within(verificationCard).findByText('3/3 terunggah')).toBeInTheDocument()
    expect(
      within(verificationCard).getByText(/Institut Teknologi Sepuluh Nopember/i),
    ).toBeInTheDocument()

    const teamCard = await screen.findByTestId('team-status-card')
    expect(await within(teamCard).findByText('Draft')).toBeInTheDocument()
    expect(within(teamCard).getByText('Tim Garuda')).toBeInTheDocument()
    expect(within(teamCard).getByText('K7M2Q9XA')).toBeInTheDocument()
    expect(within(teamCard).getByText('1/2 anggota lengkap')).toBeInTheDocument()

    const missingList = within(teamCard).getByTestId('finalize-missing-list')
    expect(within(missingList).getByText(/Proposal PDF belum diunggah/i)).toBeInTheDocument()
    expect(within(missingList).getByText(/Video Demo MP4 belum diunggah/i)).toBeInTheDocument()

    expect(screen.queryByTestId('rejection-alert')).not.toBeInTheDocument()

    // Documents, team and video are sections of this same page now.
    expect(screen.getByRole('heading', { name: /^DOKUMEN$/ })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Team & Submission Workspace/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Video Demo Upload & Player/i }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('documents-section')).toBeInTheDocument()
    expect(screen.getByTestId('team-section')).toBeInTheDocument()
    expect(screen.getByTestId('video-section')).toBeInTheDocument()
  })

  it('displays Tenggat Terlewat badge when competition deadlines are in the past', async () => {
    server.use(
      http.get('*/api/settings', () =>
        HttpResponse.json({
          ...DEFAULT_MOCK_SETTINGS,
          registration_deadline: '2020-01-01T00:00:00+07:00',
          submission_deadline: '2020-01-15T00:00:00+07:00',
        }),
      ),
    )

    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/dashboard'] },
    })

    const regCard = await screen.findByTestId('registration-countdown-card')
    expect(within(regCard).getByText('Tenggat Terlewat')).toBeInTheDocument()
  })

  it('shows rejection reason alert (ditolak), Belum Bertim card, and links the CTA to the documents section', async () => {
    const sessionUser = seedMockActiveSession('ditolak@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/dashboard'] },
    })

    const rejectionAlert = await screen.findByTestId('rejection-alert')
    expect(
      within(rejectionAlert).getByText(/Verifikasi Peserta Ditolak — Perlu Perbaikan/i),
    ).toBeInTheDocument()
    expect(
      within(rejectionAlert).getByText(
        /Scan KTM tidak terbaca, mohon unggah ulang dokumen yang jelas\./i,
      ),
    ).toBeInTheDocument()

    expect(await screen.findByTestId('verification-status-badge')).toHaveTextContent('Ditolak')
    expect(await screen.findByTestId('team-status-badge')).toHaveTextContent('Belum Bertim')

    expect(
      within(rejectionAlert).getByRole('link', { name: /Unggah Ulang Dokumen/i }),
    ).toHaveAttribute('href', '#documents-section')
    expect(
      await screen.findByRole('heading', { name: /^DOKUMEN$/ }),
    ).toBeInTheDocument()
  })

  it('surfaces error banner when a dashboard endpoint fails and recovers on retry', async () => {
    const user = userEvent.setup()
    const sessionUser = seedMockActiveSession('budi@mahasiswa.ac.id')!
    useAuthStore.getState().setSessionUser(sessionUser)

    let failing = true
    server.use(
      http.get('*/api/teams/me', () => {
        if (failing) {
          return HttpResponse.json(
            {
              error: {
                code: 'rate_limited',
                message: 'Terlalu banyak permintaan',
                details: {},
              },
            },
            { status: 429 },
          )
        }
        return HttpResponse.json({ team: null }, { status: 200 })
      }),
    )

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: ['/dashboard'] },
    })

    const errorBanner = await screen.findByTestId('dashboard-error-alert')
    failing = false
    await user.click(within(errorBanner).getByRole('button', { name: /Coba Muat Ulang/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('dashboard-error-alert')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('team-status-badge')).toHaveTextContent('Belum Bertim')
  })
})
