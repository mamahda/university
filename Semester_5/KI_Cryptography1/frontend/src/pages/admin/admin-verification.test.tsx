import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { AdminParticipantDetailResponse } from '../../api'
import { seedMockActiveSession } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { AppRoutes } from '../../router'
import { useAuthStore } from '../../stores/authStore'
import { renderWithProviders } from '../../test/test-utils'

const BUDI_ID = 'b1a7c2d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d'
const NADIA_ID = 'a1b2c3d4-9999-4888-8777-666655554444'
const RINA_ID = 'f1e2d3c4-b5a6-4789-8012-3456789abcde'

function signInAsAdmin() {
  const sessionUser = seedMockActiveSession('admin@panitia.id')
  if (!sessionUser) {
    throw new Error('Seeded superadmin account missing')
  }
  useAuthStore.getState().setSessionUser(sessionUser)
  return sessionUser
}

function renderAt(path: string) {
  return renderWithProviders(<AppRoutes />, { routerProps: { initialEntries: [path] } })
}

function minorDetail(): AdminParticipantDetailResponse {
  return {
    user_id: BUDI_ID,
    email: 'budi@mahasiswa.ac.id',
    profile: {
      full_name: 'Budi Santoso',
      nim: '5025231001',
      study_program: 'Teknik Informatika',
      institution: 'Institut Teknologi Sepuluh Nopember',
      birth_date: '2009-03-14',
      domicile: 'Surabaya',
      phone: '081234567890',
      age: 17,
      is_minor: true,
      profile_complete: true,
      verification_status: 'menunggu',
      verification_note: null,
    },
    documents: {
      ktp: {
        item_id: '3f6c1e2a-8b4d-4c1f-9e7a-2b5d8c0f1a93',
        field: 'ktp',
        content_type: 'image/jpeg',
        size_bytes: 482_113,
        original_filename: 'ktp-budi.jpg',
        uploaded_at: '2026-10-26T10:00:00+07:00',
      },
      ktm: null,
      twibbon: null,
      documents_complete: false,
    },
    verification_status: 'menunggu',
    verification_note: null,
    team: { id: '9c8b7a6d-5e4f-4321-8765-0fedcba98765', name: 'Tim Garuda', status: 'draft' },
  }
}

describe('Superadmin participant verification', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  /* ---------------------------------------------------------------------- */
  /* Verification queue                                                     */
  /* ---------------------------------------------------------------------- */

  it('lists participants with status, documents readiness, and team', async () => {
    signInAsAdmin()
    renderAt('/admin/participants')

    const table = await screen.findByTestId('participants-table')
    const row = within(table).getByTestId(`participant-row-${BUDI_ID}`)
    expect(row).toHaveTextContent('Budi Santoso')
    expect(row).toHaveTextContent('budi@mahasiswa.ac.id')
    expect(row).toHaveTextContent(/Menunggu/i)
    expect(row).toHaveTextContent('Tim Garuda')

    expect(within(table).getByTestId(`participant-row-${NADIA_ID}`)).toHaveTextContent(
      /Terverifikasi/i,
    )
  })

  it('filters the queue by verification status through the API, not in the browser', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    const requestedUrls: string[] = []
    server.use(
      http.get('*/api/admin/participants', ({ request }) => {
        requestedUrls.push(request.url)
        return HttpResponse.json(
          { items: [], page: 1, page_size: 25, total: 0 },
          { status: 200 },
        )
      }),
    )

    renderAt('/admin/participants')
    await screen.findByTestId('participants-empty-state')

    await user.selectOptions(screen.getByTestId('participants-status-filter'), 'menunggu')

    await waitFor(() => {
      expect(requestedUrls.at(-1)).toContain('status=menunggu')
    })
  })

  it('pages through the queue and reports the current window', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    const requestedUrls: string[] = []
    server.use(
      http.get('*/api/admin/participants', ({ request }) => {
        requestedUrls.push(request.url)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? '1')
        return HttpResponse.json(
          {
            items: [
              {
                user_id: page === 1 ? BUDI_ID : NADIA_ID,
                email: page === 1 ? 'budi@mahasiswa.ac.id' : 'nadia@mahasiswa.ac.id',
                full_name: page === 1 ? 'Budi Santoso' : 'Nadia Putri',
                institution: 'Institut Teknologi Sepuluh Nopember',
                age: 21,
                is_minor: false,
                verification_status: 'menunggu',
                documents_complete: true,
                team_name: null,
              },
            ],
            page,
            page_size: 1,
            total: 2,
          },
          { status: 200 },
        )
      }),
    )

    renderAt('/admin/participants')

    const pagination = await screen.findByTestId('participants-pagination')
    expect(pagination).toHaveTextContent('1')
    expect(pagination).toHaveTextContent('2')

    await user.click(within(pagination).getByTestId('page-next'))

    expect(await screen.findByText('Nadia Putri')).toBeInTheDocument()
    expect(requestedUrls.at(-1)).toContain('page=2')
  })

  it('tells the admin when no participant matches the filter', async () => {
    signInAsAdmin()
    server.use(
      http.get('*/api/admin/participants', () =>
        HttpResponse.json({ items: [], page: 1, page_size: 25, total: 0 }, { status: 200 }),
      ),
    )

    renderAt('/admin/participants')

    expect(await screen.findByTestId('participants-empty-state')).toBeInTheDocument()
    expect(screen.queryByTestId('participants-table')).not.toBeInTheDocument()
  })

  it('opens a participant detail from the queue', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    renderAt('/admin/participants')

    const table = await screen.findByTestId('participants-table')
    await user.click(within(table).getByRole('link', { name: /Budi Santoso/i }))

    expect(await screen.findByTestId('participant-detail')).toBeInTheDocument()
  })

  /* ---------------------------------------------------------------------- */
  /* Participant detail                                                    */
  /* ---------------------------------------------------------------------- */

  it('shows the full profile, the team, and the stored documents', async () => {
    signInAsAdmin()
    renderAt(`/admin/participants/${BUDI_ID}`)

    const detail = await screen.findByTestId('participant-detail')
    const profile = within(detail).getByTestId('participant-profile')
    expect(profile).toHaveTextContent('Budi Santoso')
    expect(profile).toHaveTextContent('5025231001')
    expect(profile).toHaveTextContent('Teknik Informatika')
    expect(profile).toHaveTextContent('081234567890')
    expect(profile).toHaveTextContent('Tim Garuda')

    const documents = within(detail).getByTestId('participant-documents')
    expect(within(documents).getByTestId('artifact-ktp')).toHaveTextContent('ktp-budi.jpg')
    expect(within(documents).getByTestId('artifact-ktm')).toBeInTheDocument()
    expect(within(documents).getByTestId('artifact-twibbon')).toBeInTheDocument()
  })

  it('flags an underage participant with an is_minor badge', async () => {
    signInAsAdmin()
    server.use(
      http.get('*/api/admin/participants/:userId', () =>
        HttpResponse.json(minorDetail(), { status: 200 }),
      ),
    )

    renderAt(`/admin/participants/${BUDI_ID}`)

    const badge = await screen.findByTestId('is-minor-badge')
    expect(badge).toHaveTextContent(/di bawah umur/i)
    expect(badge).toHaveTextContent('17')
  })

  it('omits the minor badge for an adult participant', async () => {
    signInAsAdmin()
    renderAt(`/admin/participants/${BUDI_ID}`)

    await screen.findByTestId('participant-detail')
    expect(screen.queryByTestId('is-minor-badge')).not.toBeInTheDocument()
  })

  it('opens a stored document as a full authenticated blob', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    renderAt(`/admin/participants/${BUDI_ID}`)

    await screen.findByTestId('participant-detail')
    await user.click(screen.getByTestId('view-btn-ktp'))

    expect(await screen.findByTestId('artifact-viewer-image')).toBeInTheDocument()
  })

  /* ---------------------------------------------------------------------- */
  /* Approve / reject                                                       */
  /* ---------------------------------------------------------------------- */

  it('approves a participant and reflects the new status without a reload', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    renderAt(`/admin/participants/${BUDI_ID}`)

    await screen.findByTestId('participant-detail')
    await user.click(screen.getByTestId('approve-btn'))

    expect(await screen.findByTestId('verify-success')).toHaveTextContent(/terverifikasi/i)
    expect(screen.getByTestId('verification-status')).toHaveTextContent(/Terverifikasi/i)
  })

  it('refuses to reject without a note before any request is sent', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    let patchCount = 0
    server.use(
      http.patch('*/api/admin/participants/:userId', () => {
        patchCount += 1
        return HttpResponse.json(
          { user_id: BUDI_ID, verification_status: 'ditolak', verification_note: 'x' },
          { status: 200 },
        )
      }),
    )

    renderAt(`/admin/participants/${BUDI_ID}`)

    await screen.findByTestId('participant-detail')
    await user.click(screen.getByTestId('reject-btn'))

    expect(await screen.findByTestId('note-error')).toHaveTextContent(/wajib/i)
    expect(patchCount).toBe(0)
  })

  it('rejects a participant once a note is supplied and sends the note', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    const bodies: unknown[] = []
    server.use(
      http.patch('*/api/admin/participants/:userId', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json(
          {
            user_id: BUDI_ID,
            verification_status: 'ditolak',
            verification_note: 'Scan KTM tidak terbaca.',
          },
          { status: 200 },
        )
      }),
    )

    renderAt(`/admin/participants/${BUDI_ID}`)

    await screen.findByTestId('participant-detail')
    await user.type(screen.getByTestId('note-input'), 'Scan KTM tidak terbaca.')
    await user.click(screen.getByTestId('reject-btn'))

    expect(await screen.findByTestId('verify-success')).toHaveTextContent(/ditolak/i)
    expect(bodies).toEqual([
      { verification_status: 'ditolak', note: 'Scan KTM tidak terbaca.' },
    ])
  })

  it('shows the existing rejection note when reopening a rejected participant', async () => {
    signInAsAdmin()
    renderAt(`/admin/participants/${RINA_ID}`)

    const detail = await screen.findByTestId('participant-detail')
    expect(within(detail).getByTestId('verification-status')).toHaveTextContent(/Ditolak/i)
    expect(within(detail).getByTestId('existing-note')).toHaveTextContent(
      /Scan KTM tidak terbaca/i,
    )
  })

  it('surfaces a server validation error from the verification request', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    server.use(
      http.patch('*/api/admin/participants/:userId', () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_error',
              message: 'Data tidak valid',
              details: { fields: { note: 'Catatan wajib diisi saat menolak peserta.' } },
            },
          },
          { status: 400 },
        ),
      ),
    )

    renderAt(`/admin/participants/${BUDI_ID}`)

    await screen.findByTestId('participant-detail')
    await user.click(screen.getByTestId('approve-btn'))

    expect(await screen.findByTestId('verify-error')).toHaveTextContent(/Data tidak valid/i)
  })

  it('reports 404 for an unknown participant', async () => {
    signInAsAdmin()
    renderAt('/admin/participants/00000000-0000-4000-8000-000000000000')

    expect(await screen.findByTestId('participant-detail-error')).toHaveTextContent(
      /tidak ditemukan/i,
    )
  })
})
