import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, type JuriTeamDetail } from '../../api'
import { seedMockActiveSession, setMockTeamStatus } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { AppRoutes } from '../../router'
import { useAuthStore } from '../../stores/authStore'
import { renderWithProviders } from '../../test/test-utils'

const GARUDA_TEAM_ID = '9c8b7a6d-5e4f-4321-8765-0fedcba98765'
const BLOB_URL = 'blob:http://localhost:5173/mock-juri-blob'

function mp4File(name: string, sizeBytes = 2048): File {
  const bytes = new Uint8Array(Math.max(sizeBytes, 16))
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0)
  return new File([bytes], name, { type: 'video/mp4' })
}

function signInAs(email: string) {
  const sessionUser = seedMockActiveSession(email)
  if (!sessionUser) {
    throw new Error(`Seeded account missing: ${email}`)
  }
  useAuthStore.getState().setSessionUser(sessionUser)
  return sessionUser
}

function detailFixture(overrides: Partial<JuriTeamDetail> = {}): JuriTeamDetail {
  return {
    id: GARUDA_TEAM_ID,
    name: 'Tim Garuda',
    finalized_at: '2026-12-01T20:10:00+07:00',
    members: [
      { full_name: 'Budi Santoso', institution: 'Universitas Contoh', is_leader: true },
      { full_name: 'Sari Dewi', institution: 'Universitas Contoh', is_leader: false },
    ],
    proposal: {
      item_id: '5a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
      field: 'proposal',
      content_type: 'application/pdf',
      size_bytes: 4_718_592,
      original_filename: 'proposal.pdf',
      uploaded_at: '2026-11-30T19:00:00+07:00',
    },
    video: {
      item_id: '6c2d8e4f-0a1b-4c3d-9e5f-7a8b9c0d1e2f',
      field: 'video',
      content_type: 'video/mp4',
      size_bytes: 73_400_320,
      original_filename: 'demo.mp4',
      uploaded_at: '2026-11-30T19:20:00+07:00',
    },
    repo_url: 'https://github.com/tim-garuda/schematics-app',
    ...overrides,
  }
}

function serveDetail(team: JuriTeamDetail) {
  server.use(
    http.get('*/api/juri/teams/:teamId', () => HttpResponse.json({ team }, { status: 200 })),
  )
}

/** Known bytes so a blob viewer can be asserted without the real ciphertext. */
function serveItemBytes(contentType: string) {
  const bytes = new TextEncoder().encode('demo-payload')
  server.use(
    http.get('*/api/items/:itemId', () => {
      const body = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer
      return new HttpResponse(body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(bytes.byteLength),
          'Content-Disposition': "inline; filename*=UTF-8''demo.bin",
        },
      })
    }),
  )
}

describe('Juri Portal', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  /* ---------------------------------------------------------------------- */
  /* Finalized teams table                                                  */
  /* ---------------------------------------------------------------------- */

  it('lists only finalized teams with member count and finalize time', async () => {
    signInAs('juri1@panitia.id')
    setMockTeamStatus(GARUDA_TEAM_ID, 'final')

    renderWithProviders(<AppRoutes />, { routerProps: { initialEntries: ['/juri/teams'] } })

    const table = await screen.findByTestId('juri-teams-table')
    const row = within(table).getByTestId(`juri-team-row-${GARUDA_TEAM_ID}`)
    expect(row).toHaveTextContent('Tim Garuda')
    expect(row).toHaveTextContent('2')
  })

  it('shows an empty state while no team has submitted final', async () => {
    signInAs('juri1@panitia.id')

    renderWithProviders(<AppRoutes />, { routerProps: { initialEntries: ['/juri/teams'] } })

    expect(await screen.findByTestId('juri-teams-empty-state')).toBeInTheDocument()
    expect(screen.queryByTestId('juri-teams-table')).not.toBeInTheDocument()
  })

  it('opens a team detail from the table', async () => {
    const user = userEvent.setup()
    signInAs('juri1@panitia.id')
    setMockTeamStatus(GARUDA_TEAM_ID, 'final')
    serveDetail(detailFixture())

    renderWithProviders(<AppRoutes />, { routerProps: { initialEntries: ['/juri/teams'] } })

    const table = await screen.findByTestId('juri-teams-table')
    await user.click(within(table).getByRole('link', { name: /Tim Garuda/i }))

    expect(await screen.findByTestId('juri-team-detail')).toBeInTheDocument()
  })

  /* ---------------------------------------------------------------------- */
  /* Team detail: members, artifacts, GitHub link                            */
  /* ---------------------------------------------------------------------- */

  it('shows members, proposal and video metadata, and the GitHub link', async () => {
    signInAs('juri1@panitia.id')
    serveDetail(detailFixture())

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: [`/juri/teams/${GARUDA_TEAM_ID}`] },
    })

    const detail = await screen.findByTestId('juri-team-detail')
    expect(detail).toHaveTextContent('Tim Garuda')

    const members = within(detail).getByTestId('juri-team-members')
    expect(members).toHaveTextContent('Budi Santoso')
    expect(members).toHaveTextContent(/Ketua/i)
    expect(members).toHaveTextContent('Sari Dewi')

    expect(within(detail).getByTestId('artifact-proposal')).toHaveTextContent('proposal.pdf')
    expect(within(detail).getByTestId('artifact-proposal')).toHaveTextContent('4.50 MB')
    expect(within(detail).getByTestId('artifact-video')).toHaveTextContent('demo.mp4')

    const repoLink = within(detail).getByTestId('artifact-repo-link')
    expect(repoLink).toHaveAttribute('href', 'https://github.com/tim-garuda/schematics-app')
    expect(repoLink).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('notes each artifact that the team never submitted', async () => {
    signInAs('juri1@panitia.id')
    serveDetail(detailFixture({ proposal: null, video: null, repo_url: null }))

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: [`/juri/teams/${GARUDA_TEAM_ID}`] },
    })

    const detail = await screen.findByTestId('juri-team-detail')
    expect(within(detail).getByTestId('artifact-proposal')).toHaveTextContent(/Tidak ada/i)
    expect(within(detail).getByTestId('artifact-video')).toHaveTextContent(/Tidak ada/i)
    expect(within(detail).getByTestId('artifact-repo')).toHaveTextContent(/Tidak ada/i)
    expect(screen.queryByTestId('artifact-repo-link')).not.toBeInTheDocument()
  })

  it('reports 404 when the team does not exist or has not finalized', async () => {
    signInAs('juri1@panitia.id')

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: [`/juri/teams/${GARUDA_TEAM_ID}`] },
    })

    expect(await screen.findByTestId('juri-detail-error')).toHaveTextContent(/belum submit final/i)
  })

  /* ---------------------------------------------------------------------- */
  /* Blob viewer                                                            */
  /* ---------------------------------------------------------------------- */

  it('views the proposal PDF from a full blob and revokes the Object URL on unmount', async () => {
    const user = userEvent.setup()
    signInAs('juri1@panitia.id')
    serveDetail(detailFixture())
    serveItemBytes('application/pdf')

    const createSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => BLOB_URL)
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)

    try {
      const { unmount } = renderWithProviders(<AppRoutes />, {
        routerProps: { initialEntries: [`/juri/teams/${GARUDA_TEAM_ID}`] },
      })

      await screen.findByTestId('juri-team-detail')
      await user.click(screen.getByTestId('view-btn-proposal'))

      expect(await screen.findByTestId('artifact-viewer-pdf')).toHaveAttribute('src', BLOB_URL)

      unmount()
      expect(revokeSpy).toHaveBeenCalledWith(BLOB_URL)
    } finally {
      createSpy.mockRestore()
      revokeSpy.mockRestore()
    }
  })

  it('plays a finalized team video that the real access rules release to a juri', async () => {
    const user = userEvent.setup()

    // Seed a genuine video item through the leader-only endpoint, then finalize,
    // so the juri reads it through the unmodified authorization path.
    signInAs('budi@mahasiswa.ac.id')
    const uploaded = await apiClient.teams.uploadVideo(mp4File('demo-garuda.mp4'))
    setMockTeamStatus(GARUDA_TEAM_ID, 'final')

    signInAs('juri1@panitia.id')
    serveDetail(detailFixture({ proposal: null, video: uploaded }))

    const createSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => BLOB_URL)
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)

    try {
      renderWithProviders(<AppRoutes />, {
        routerProps: { initialEntries: [`/juri/teams/${GARUDA_TEAM_ID}`] },
      })

      await screen.findByTestId('juri-team-detail')
      await user.click(screen.getByTestId('view-btn-video'))

      expect(await screen.findByTestId('artifact-viewer-video')).toHaveAttribute('src', BLOB_URL)
    } finally {
      createSpy.mockRestore()
      revokeSpy.mockRestore()
    }
  })

  it('surfaces 500 integrity_error instead of rendering a tampered artifact', async () => {
    const user = userEvent.setup()
    signInAs('juri1@panitia.id')
    serveDetail(detailFixture())

    server.use(
      http.get('*/api/items/:itemId', () =>
        HttpResponse.json(
          {
            error: {
              code: 'integrity_error',
              message: 'HMAC atau pencocokan tiga cipher gagal; insiden dicatat.',
              details: {},
            },
          },
          { status: 500 },
        ),
      ),
    )

    renderWithProviders(<AppRoutes />, {
      routerProps: { initialEntries: [`/juri/teams/${GARUDA_TEAM_ID}`] },
    })

    await screen.findByTestId('juri-team-detail')
    await user.click(screen.getByTestId('view-btn-proposal'))

    expect(await screen.findByTestId('viewer-error-proposal')).toHaveTextContent(
      /integrity_error/i,
    )
    expect(screen.queryByTestId('artifact-viewer-pdf')).not.toBeInTheDocument()
  })
})
