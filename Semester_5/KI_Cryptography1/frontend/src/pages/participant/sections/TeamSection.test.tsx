import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Team } from '@/api'
import { seedMockActiveSession, setMockTeamStatus } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { AppRoutes } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { renderWithProviders } from '@/test/test-utils'

const GARUDA_TEAM_ID = '9c8b7a6d-5e4f-4321-8765-0fedcba98765'
const BUDI_ID = 'b1a7c2d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d'

function pdfFile(name: string, sizeBytes: number): File {
  const header = new TextEncoder().encode('%PDF-1.4\n')
  const bytes = new Uint8Array(sizeBytes)
  bytes.set(header.subarray(0, Math.min(header.length, sizeBytes)))
  return new File([bytes], name, { type: 'application/pdf' })
}

/** A team whose finalize gate is fully satisfied, for isolating the finalize flow. */
function readyTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: GARUDA_TEAM_ID,
    name: 'Tim Garuda',
    code: 'K7M2Q9XA',
    status: 'draft',
    leader_id: BUDI_ID,
    created_at: '2026-10-27T08:00:00+07:00',
    finalized_at: null,
    members: [
      {
        user_id: BUDI_ID,
        full_name: 'Budi Santoso',
        is_leader: true,
        profile_complete: true,
        documents_complete: true,
      },
      {
        user_id: 'd4e5f6a7-1111-4222-8333-444455556666',
        full_name: 'Sari Dewi',
        is_leader: false,
        profile_complete: true,
        documents_complete: true,
      },
    ],
    submission: {
      proposal: {
        item_id: 'item-proposal',
        field: 'proposal',
        content_type: 'application/pdf',
        size_bytes: 2048,
        original_filename: 'proposal-garuda.pdf',
        uploaded_at: '2026-10-27T09:00:00+07:00',
      },
      video: {
        item_id: 'item-video',
        field: 'video',
        content_type: 'video/mp4',
        size_bytes: 4096,
        original_filename: 'demo.mp4',
        uploaded_at: '2026-10-27T09:10:00+07:00',
      },
      repo_url: 'https://github.com/tim-garuda/schematics-app',
    },
    finalize_missing: [],
    ...overrides,
  }
}

function signInAs(email: string) {
  const sessionUser = seedMockActiveSession(email)
  if (!sessionUser) {
    throw new Error(`Seeded account missing: ${email}`)
  }
  useAuthStore.getState().setSessionUser(sessionUser)
  return sessionUser
}

function renderWorkspace() {
  return renderWithProviders(<AppRoutes />, { routerProps: { initialEntries: ['/dashboard'] } })
}

describe('Team & Submission Workspace', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('offers create and join forms when the participant has no team', async () => {
    signInAs('terverifikasi@mahasiswa.ac.id')
    renderWorkspace()

    expect(await screen.findByTestId('team-empty-state')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Buat Tim/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gabung Tim/i })).toBeInTheDocument()
    expect(screen.queryByTestId('team-card')).not.toBeInTheDocument()
  })

  it('creates a team and shows its 8-character invite code', async () => {
    const user = userEvent.setup()
    signInAs('terverifikasi@mahasiswa.ac.id')
    renderWorkspace()

    await user.type(await screen.findByLabelText(/Nama Tim/i), 'Tim Rajawali')
    await user.click(screen.getByRole('button', { name: /Buat Tim/i }))

    const card = await screen.findByTestId('team-card')
    expect(within(card).getByText('Tim Rajawali')).toBeInTheDocument()
    expect(within(card).getByTestId('invite-code').textContent).toMatch(/^[A-Z0-9]{8}$/)
  })

  it('rejects an invite code that is not 8 characters without calling the API', async () => {
    const user = userEvent.setup()
    signInAs('terverifikasi@mahasiswa.ac.id')

    let joinCalls = 0
    server.use(
      http.post('*/api/teams/join', () => {
        joinCalls += 1
        return HttpResponse.json({ team: null }, { status: 200 })
      }),
    )

    renderWorkspace()

    await user.type(await screen.findByLabelText(/Kode Tim/i), 'ABC12')
    await user.click(screen.getByRole('button', { name: /Gabung Tim/i }))

    expect(await screen.findByTestId('team-form-error')).toHaveTextContent(/8 karakter/i)
    expect(joinCalls).toBe(0)
  })

  it('joins an existing team using a lowercase invite code', async () => {
    const user = userEvent.setup()
    signInAs('terverifikasi@mahasiswa.ac.id')
    renderWorkspace()

    await user.type(await screen.findByLabelText(/Kode Tim/i), 'k7m2q9xa')
    await user.click(screen.getByRole('button', { name: /Gabung Tim/i }))

    const card = await screen.findByTestId('team-card')
    expect(within(card).getByText('Tim Garuda')).toBeInTheDocument()
  })

  it('copies the invite code to the clipboard', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    await screen.findByTestId('team-card')
    await user.click(screen.getByRole('button', { name: /Salin Kode/i }))

    await waitFor(async () => {
      expect(await navigator.clipboard.readText()).toBe('K7M2Q9XA')
    })
  })

  it('lists members with their profile and document readiness', async () => {
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    const rows = await screen.findAllByTestId('member-row')
    expect(rows).toHaveLength(2)

    const leaderRow = rows[0]!
    expect(within(leaderRow).getByText('Budi Santoso')).toBeInTheDocument()
    expect(within(leaderRow).getByText(/Ketua/i)).toBeInTheDocument()

    // Sari has a complete profile but incomplete documents in the seeded team.
    const memberRow = rows[1]!
    expect(within(memberRow).getByText('Sari Dewi')).toBeInTheDocument()
    expect(within(memberRow).getByText('Profil')).toBeInTheDocument()
    expect(within(memberRow).getByText('Dokumen')).toBeInTheDocument()

    expect(screen.getByTestId('member-readiness-summary')).toHaveTextContent(
      '1/2 anggota lengkap',
    )
  })

  it('lets a non-leader member leave the team after confirming', async () => {
    const user = userEvent.setup()
    signInAs('sari@mahasiswa.ac.id')
    renderWorkspace()

    await screen.findByTestId('team-card')
    await user.click(screen.getByRole('button', { name: /Keluar dari Tim/i }))
    await user.click(screen.getByRole('button', { name: /Ya, Keluar/i }))

    expect(await screen.findByTestId('team-empty-state')).toBeInTheDocument()
  })

  it('offers no leave action to the leader, since the contract forbids it', async () => {
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    expect(await screen.findByTestId('leader-cannot-leave-notice')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Keluar dari Tim/i })).not.toBeInTheDocument()
  })

  it('lets the leader remove a member after confirming', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    await screen.findByTestId('team-card')
    await user.click(screen.getByRole('button', { name: /Keluarkan Sari Dewi/i }))
    await user.click(screen.getByRole('button', { name: /Ya, Keluarkan/i }))

    await waitFor(() => {
      expect(screen.getAllByTestId('member-row')).toHaveLength(1)
    })
  })

  it('surfaces the API error message when removing a member fails', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    server.use(
      http.delete('*/api/teams/me/members/:userId', () =>
        HttpResponse.json(
          {
            error: {
              code: 'team_locked',
              message: 'Tim sudah difinalisasi sehingga anggota tidak dapat diubah.',
              details: {},
            },
          },
          { status: 409 },
        ),
      ),
    )

    renderWorkspace()

    await screen.findByTestId('team-card')
    await user.click(screen.getByRole('button', { name: /Keluarkan Sari Dewi/i }))
    await user.click(screen.getByRole('button', { name: /Ya, Keluarkan/i }))

    const alert = await screen.findByTestId('team-error-alert')
    expect(alert).toHaveTextContent(/tidak dapat diubah/i)
    expect(screen.getAllByTestId('member-row')).toHaveLength(2)
  })

  it('shows leader submission controls only to the leader', async () => {
    signInAs('sari@mahasiswa.ac.id')
    renderWorkspace()

    await screen.findByTestId('team-card')
    expect(screen.queryByTestId('leader-submission-section')).not.toBeInTheDocument()
  })

  it('lists the outstanding finalize requirements for the leader', async () => {
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    const checklist = await screen.findByTestId('finalize-checklist')
    expect(within(checklist).getByText(/Proposal PDF/i)).toBeInTheDocument()
    expect(within(checklist).getByText(/Video Demo/i)).toBeInTheDocument()
    expect(within(checklist).getByText(/Repositori GitHub/i)).toBeInTheDocument()
  })

  it('rejects a proposal larger than 10 MB without calling the API', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    let uploadCalls = 0
    server.use(
      http.post('*/api/teams/me/proposal', () => {
        uploadCalls += 1
        return new HttpResponse(null, { status: 201 })
      }),
    )

    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    await user.upload(
      screen.getByTestId('file-input-proposal'),
      pdfFile('proposal-besar.pdf', 10_485_761),
    )

    expect(await screen.findByTestId('proposal-error')).toHaveTextContent(/10(\.00)? MB/i)
    expect(uploadCalls).toBe(0)
  })

  it('rejects a proposal whose magic bytes are not PDF without calling the API', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    let uploadCalls = 0
    server.use(
      http.post('*/api/teams/me/proposal', () => {
        uploadCalls += 1
        return new HttpResponse(null, { status: 201 })
      }),
    )

    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    const notAPdf = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'gambar.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByTestId('file-input-proposal'), notAPdf)

    expect(await screen.findByTestId('proposal-error')).toBeInTheDocument()
    expect(uploadCalls).toBe(0)
  })

  it('uploads a valid proposal PDF and shows its filename', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    await user.upload(
      screen.getByTestId('file-input-proposal'),
      pdfFile('proposal-garuda.pdf', 4096),
    )

    expect(await screen.findByTestId('proposal-meta')).toHaveTextContent('proposal-garuda.pdf')
  })

  it('rejects a repo URL that is not https://github.com/<owner>/<repo>', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    let repoCalls = 0
    server.use(
      http.put('*/api/teams/me/repo', () => {
        repoCalls += 1
        return HttpResponse.json({ repo_url: 'x' }, { status: 200 })
      }),
    )

    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    await user.type(screen.getByLabelText(/Repositori GitHub/i), 'https://gitlab.com/a/b')
    await user.click(screen.getByRole('button', { name: /Simpan Link/i }))

    expect(await screen.findByTestId('repo-error')).toBeInTheDocument()
    expect(repoCalls).toBe(0)
  })

  it('saves a valid GitHub repo URL', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    await user.type(
      screen.getByLabelText(/Repositori GitHub/i),
      'https://github.com/tim-garuda/schematics-app',
    )
    await user.click(screen.getByRole('button', { name: /Simpan Link/i }))

    expect(await screen.findByTestId('repo-url-value')).toHaveTextContent(
      'https://github.com/tim-garuda/schematics-app',
    )
  })

  it('blocks Submit Final while requirements are still missing', async () => {
    signInAs('budi@mahasiswa.ac.id')
    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    expect(screen.getByRole('button', { name: /Submit Final/i })).toBeDisabled()
  })

  it('finalizes through a two-step confirmation and locks the workspace', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    server.use(
      http.get('*/api/teams/me', () => HttpResponse.json({ team: readyTeam() }, { status: 200 })),
      http.post('*/api/teams/me/finalize', () =>
        HttpResponse.json(
          {
            team: readyTeam({ status: 'final', finalized_at: '2026-10-27T10:00:00+07:00' }),
          },
          { status: 200 },
        ),
      ),
    )

    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    await user.click(screen.getByRole('button', { name: /Submit Final/i }))

    const modal = await screen.findByTestId('finalize-confirm-modal')
    await user.click(within(modal).getByRole('button', { name: /Ya, Submit Final/i }))

    expect(await screen.findByTestId('team-locked-notice')).toBeInTheDocument()
    expect(screen.getByTestId('team-section-status-badge')).toHaveTextContent(/Final/i)
    expect(screen.queryByRole('button', { name: /Submit Final/i })).not.toBeInTheDocument()
    expect(screen.queryByTestId('file-input-proposal')).not.toBeInTheDocument()
  })

  it('cancelling the finalize modal leaves the team in draft', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    let finalizeCalls = 0
    server.use(
      http.get('*/api/teams/me', () => HttpResponse.json({ team: readyTeam() }, { status: 200 })),
      http.post('*/api/teams/me/finalize', () => {
        finalizeCalls += 1
        return HttpResponse.json({ team: readyTeam() }, { status: 200 })
      }),
    )

    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    await user.click(screen.getByRole('button', { name: /Submit Final/i }))

    const modal = await screen.findByTestId('finalize-confirm-modal')
    await user.click(within(modal).getByRole('button', { name: /Batal/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('finalize-confirm-modal')).not.toBeInTheDocument()
    })
    expect(finalizeCalls).toBe(0)
    expect(screen.getByTestId('team-section-status-badge')).toHaveTextContent('Draft')
  })

  it('surfaces finalize_requirements returned by the server', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    server.use(
      http.get('*/api/teams/me', () => HttpResponse.json({ team: readyTeam() }, { status: 200 })),
      http.post('*/api/teams/me/finalize', () =>
        HttpResponse.json(
          {
            error: {
              code: 'finalize_requirements',
              message: 'Syarat submit final belum lengkap.',
              details: { missing: ['video'] },
            },
          },
          { status: 409 },
        ),
      ),
    )

    renderWorkspace()

    await screen.findByTestId('leader-submission-section')
    await user.click(screen.getByRole('button', { name: /Submit Final/i }))
    const modal = await screen.findByTestId('finalize-confirm-modal')
    await user.click(within(modal).getByRole('button', { name: /Ya, Submit Final/i }))

    expect(await screen.findByTestId('team-error-alert')).toHaveTextContent(/belum lengkap/i)
    expect(screen.getByTestId('team-section-status-badge')).toHaveTextContent('Draft')
  })

  it('locks membership actions once the team is final', async () => {
    signInAs('budi@mahasiswa.ac.id')
    setMockTeamStatus(GARUDA_TEAM_ID, 'final')
    renderWorkspace()

    expect(await screen.findByTestId('team-locked-notice')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Keluarkan Sari Dewi/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Keluar dari Tim/i })).not.toBeInTheDocument()
  })
})
