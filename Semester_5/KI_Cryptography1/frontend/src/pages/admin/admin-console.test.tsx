import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { seedMockActiveSession, setMockTeamStatus } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { AppRoutes } from '../../router'
import { useAuthStore } from '../../stores/authStore'
import { renderWithProviders } from '../../test/test-utils'

const GARUDA_TEAM_ID = '9c8b7a6d-5e4f-4321-8765-0fedcba98765'
const ADMIN_ID = 'a0000000-0000-4000-8000-000000000001'

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

describe('Superadmin teams overview', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('lists every team with status, leader, and member count', async () => {
    signInAsAdmin()
    renderAt('/admin/teams')

    const table = await screen.findByTestId('admin-teams-table')
    const row = within(table).getByTestId(`admin-team-row-${GARUDA_TEAM_ID}`)
    expect(row).toHaveTextContent('Tim Garuda')
    expect(row).toHaveTextContent('Budi Santoso')
    expect(row).toHaveTextContent(/Draft/i)
    expect(row).toHaveTextContent('2')
  })

  it('shows the finalize time once a team has locked its submission', async () => {
    signInAsAdmin()
    setMockTeamStatus(GARUDA_TEAM_ID, 'final')

    renderAt('/admin/teams')

    const row = within(await screen.findByTestId('admin-teams-table')).getByTestId(
      `admin-team-row-${GARUDA_TEAM_ID}`,
    )
    expect(row).toHaveTextContent(/Final/i)
    expect(row).not.toHaveTextContent('—')
  })
})

describe('Superadmin juri accounts', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('lists the existing juri accounts', async () => {
    signInAsAdmin()
    renderAt('/admin/juri')

    const list = await screen.findByTestId('juri-accounts-list')
    expect(list).toHaveTextContent('juri1@panitia.id')
  })

  it('assigns a final team to a juri and keeps it after reload', async () => {
    signInAsAdmin()
    setMockTeamStatus(GARUDA_TEAM_ID, 'final')
    const user = userEvent.setup()
    const view = renderAt('/admin/juri')

    const juriId = 'e4d3c2b1-a098-4765-8432-10fedcba9876' // juri1@panitia.id in the mock seed
    const checkbox = await screen.findByTestId(`juri-assign-${juriId}-${GARUDA_TEAM_ID}`)
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    await user.click(screen.getByTestId(`juri-assign-save-${juriId}`))
    expect(await screen.findByText('Penugasan disimpan.')).toBeInTheDocument()

    view.unmount()
    renderAt('/admin/juri')
    await waitFor(() =>
      expect(screen.getByTestId(`juri-assign-${juriId}-${GARUDA_TEAM_ID}`)).toBeChecked(),
    )
  })

  it('creates a juri account and shows it in the list', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    renderAt('/admin/juri')

    await screen.findByTestId('juri-accounts-list')
    await user.type(screen.getByTestId('juri-email-input'), 'juri2@panitia.id')
    await user.type(screen.getByTestId('juri-password-input'), 'rahasia-panjang-456')
    await user.click(screen.getByTestId('create-juri-btn'))

    expect(await screen.findByTestId('create-juri-success')).toHaveTextContent('juri2@panitia.id')
    expect(screen.getByTestId('juri-accounts-list')).toHaveTextContent('juri2@panitia.id')
  })

  it('reports 409 email_taken without clearing what the admin typed', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    renderAt('/admin/juri')

    await screen.findByTestId('juri-accounts-list')
    await user.type(screen.getByTestId('juri-email-input'), 'juri1@panitia.id')
    await user.type(screen.getByTestId('juri-password-input'), 'rahasia-panjang-456')
    await user.click(screen.getByTestId('create-juri-btn'))

    expect(await screen.findByTestId('create-juri-error')).toHaveTextContent(/email/i)
    expect(screen.getByTestId('juri-email-input')).toHaveValue('juri1@panitia.id')
  })

  it('blocks an obviously invalid email before any request is sent', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    let postCount = 0
    server.use(
      http.post('*/api/admin/juri', () => {
        postCount += 1
        return HttpResponse.json(
          { user_id: 'x', email: 'x@y.z', role: 'juri' },
          { status: 201 },
        )
      }),
    )

    renderAt('/admin/juri')

    await screen.findByTestId('juri-accounts-list')
    await user.type(screen.getByTestId('juri-email-input'), 'bukan-email')
    await user.type(screen.getByTestId('juri-password-input'), 'rahasia-panjang-456')
    await user.click(screen.getByTestId('create-juri-btn'))

    expect(await screen.findByTestId('create-juri-error')).toHaveTextContent(/email/i)
    expect(postCount).toBe(0)
  })
})

describe('Superadmin competition settings', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('prefills the form from the current settings', async () => {
    signInAsAdmin()
    renderAt('/admin/settings')

    expect(await screen.findByTestId('registration-deadline-input')).toHaveValue(
      '2026-11-20T23:59:00+07:00',
    )
    expect(screen.getByTestId('submission-deadline-input')).toHaveValue(
      '2026-12-05T23:59:00+07:00',
    )
    expect(screen.getByTestId('min-team-size-input')).toHaveValue(2)
    expect(screen.getByTestId('max-team-size-input')).toHaveValue(4)
  })

  it('saves new settings and confirms the update', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    const bodies: unknown[] = []
    server.use(
      http.put('*/api/admin/settings', async ({ request }) => {
        const body = await request.json()
        bodies.push(body)
        return HttpResponse.json(
          {
            registration_deadline: '2026-11-25T23:59:00+07:00',
            submission_deadline: '2026-12-05T23:59:00+07:00',
            min_team_size: 3,
            max_team_size: 4,
            limits: {
              document_max_bytes: 5_242_880,
              proposal_max_bytes: 10_485_760,
              video_max_bytes: 104_857_600,
            },
          },
          { status: 200 },
        )
      }),
    )

    renderAt('/admin/settings')

    const registration = await screen.findByTestId('registration-deadline-input')
    await user.clear(registration)
    await user.type(registration, '2026-11-25T23:59:00+07:00')
    const minSize = screen.getByTestId('min-team-size-input')
    await user.clear(minSize)
    await user.type(minSize, '3')
    await user.click(screen.getByTestId('save-settings-btn'))

    expect(await screen.findByTestId('settings-success')).toBeInTheDocument()
    expect(bodies).toEqual([
      {
        registration_deadline: '2026-11-25T23:59:00+07:00',
        submission_deadline: '2026-12-05T23:59:00+07:00',
        min_team_size: 3,
        max_team_size: 4,
      },
    ])
  })

  it('refuses a minimum team size above the maximum before sending it', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    let putCount = 0
    server.use(
      http.put('*/api/admin/settings', () => {
        putCount += 1
        return HttpResponse.json({}, { status: 200 })
      }),
    )

    renderAt('/admin/settings')

    const minSize = await screen.findByTestId('min-team-size-input')
    await user.clear(minSize)
    await user.type(minSize, '9')
    await user.click(screen.getByTestId('save-settings-btn'))

    expect(await screen.findByTestId('settings-error')).toHaveTextContent(/maksimum/i)
    expect(putCount).toBe(0)
  })

  it('rejects a deadline that is not a parseable timestamp before sending it', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    let putCount = 0
    server.use(
      http.put('*/api/admin/settings', () => {
        putCount += 1
        return HttpResponse.json({}, { status: 200 })
      }),
    )

    renderAt('/admin/settings')

    const registration = await screen.findByTestId('registration-deadline-input')
    await user.clear(registration)
    await user.type(registration, 'besok sore')
    await user.click(screen.getByTestId('save-settings-btn'))

    expect(await screen.findByTestId('settings-error')).toHaveTextContent(/tenggat/i)
    expect(putCount).toBe(0)
  })
})

describe('Superadmin audit logs', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('lists the audit trail newest first with actor and action', async () => {
    signInAsAdmin()
    renderAt('/admin/audit-logs')

    const table = await screen.findByTestId('audit-logs-table')
    expect(table).toHaveTextContent('juri1@panitia.id')
    expect(table).toHaveTextContent(/view_item/i)
    expect(table).toHaveTextContent(/integrity_failure/i)
  })

  it('labels an entry with no actor as a system event', async () => {
    signInAsAdmin()
    renderAt('/admin/audit-logs')

    const table = await screen.findByTestId('audit-logs-table')
    expect(within(table).getByTestId('audit-row-500')).toHaveTextContent(/Sistem/i)
  })

  it('filters by action through the API', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    const requestedUrls: string[] = []
    server.use(
      http.get('*/api/admin/audit-logs', ({ request }) => {
        requestedUrls.push(request.url)
        return HttpResponse.json(
          { items: [], page: 1, page_size: 25, total: 0 },
          { status: 200 },
        )
      }),
    )

    renderAt('/admin/audit-logs')
    await screen.findByTestId('audit-logs-empty-state')

    await user.selectOptions(screen.getByTestId('audit-action-filter'), 'verify_participant')

    await waitFor(() => {
      expect(requestedUrls.at(-1)).toContain('action=verify_participant')
    })
  })

  it('filters by actor and date window through the API', async () => {
    const user = userEvent.setup()
    signInAsAdmin()

    const requestedUrls: string[] = []
    server.use(
      http.get('*/api/admin/audit-logs', ({ request }) => {
        requestedUrls.push(request.url)
        return HttpResponse.json(
          { items: [], page: 1, page_size: 25, total: 0 },
          { status: 200 },
        )
      }),
    )

    renderAt('/admin/audit-logs')
    await screen.findByTestId('audit-logs-empty-state')

    await user.type(screen.getByTestId('audit-actor-filter'), ADMIN_ID)
    await user.type(screen.getByTestId('audit-from-filter'), '2026-10-24')
    await user.type(screen.getByTestId('audit-to-filter'), '2026-10-26')
    await user.click(screen.getByTestId('audit-apply-btn'))

    await waitFor(() => {
      const lastUrl = requestedUrls.at(-1) ?? ''
      expect(lastUrl).toContain(`actor_id=${ADMIN_ID}`)
      expect(lastUrl).toContain('from=2026-10-24')
      expect(lastUrl).toContain('to=2026-10-26')
    })
  })
})
