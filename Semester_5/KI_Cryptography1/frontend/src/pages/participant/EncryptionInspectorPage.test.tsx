import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Team } from '../../api'
import {
  seedMockActiveSession,
  tamperMockItem,
} from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { AppRoutes } from '../../router'
import { useAuthStore } from '../../stores/authStore'
import { renderWithProviders } from '../../test/test-utils'

const KTP_ITEM_ID = '3f6c1e2a-8b4d-4c1f-9e7a-2b5d8c0f1a93'
const KTM_ITEM_ID = '4a7d2f3b-9c5e-4d2a-8f8b-3c6e9d1a2b04'
const TWIBBON_ITEM_ID = '5b8e3a4c-0d6f-4e3b-9a9c-4d7f0e2b3c15'

/** The published SHA-256 of the ASCII string "abc". */
const SHA256_OF_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'

function signInAs(email: string) {
  const sessionUser = seedMockActiveSession(email)
  if (!sessionUser) {
    throw new Error(`Seeded account missing: ${email}`)
  }
  useAuthStore.getState().setSessionUser(sessionUser)
  return sessionUser
}

function renderInspector() {
  return renderWithProviders(<AppRoutes />, {
    routerProps: { initialEntries: ['/encryption-inspector'] },
  })
}

/** Serves known bytes for every item so the checksum is independently predictable. */
function serveItemBytes(text: string, contentType = 'application/octet-stream') {
  const bytes = new TextEncoder().encode(text)
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
          'Content-Disposition': "inline; filename*=UTF-8''probe.bin",
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    }),
  )
}

describe('Encryption & Integrity Inspector', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  /* ---------------------------------------------------------------------- */
  /* Item inventory                                                         */
  /* ---------------------------------------------------------------------- */

  it('lists every encrypted item with its id, field, plaintext size, and 3x ciphertext footprint', async () => {
    signInAs('budi@mahasiswa.ac.id')
    renderInspector()

    const inventory = await screen.findByTestId('item-inventory')

    const ktpRow = within(inventory).getByTestId('item-row-ktp')
    expect(ktpRow).toHaveTextContent(KTP_ITEM_ID)
    expect(ktpRow).toHaveTextContent('ktp')
    // 482_113 B plaintext -> "470.8 KB"
    expect(ktpRow).toHaveTextContent('470.8 KB')
    // 3 * 482_113 + 344 = 1_446_683 B -> "1.38 MB"
    expect(ktpRow).toHaveTextContent('1.38 MB')

    expect(within(inventory).getByTestId('item-row-ktm')).toHaveTextContent(KTM_ITEM_ID)
    expect(within(inventory).getByTestId('item-row-twibbon')).toHaveTextContent(TWIBBON_ITEM_ID)
  })

  it('includes the team proposal and video items beside the participant own documents', async () => {
    signInAs('budi@mahasiswa.ac.id')

    server.use(
      http.get('*/api/teams/me', () => {
        const team: Team = {
          id: '9c8b7a6d-5e4f-4321-8765-0fedcba98765',
          name: 'Tim Garuda',
          code: 'K7M2Q9XA',
          status: 'draft',
          leader_id: 'b1a7c2d4-5e6f-4a8b-9c0d-1e2f3a4b5c6d',
          created_at: '2026-10-27T08:00:00+07:00',
          finalized_at: null,
          members: [],
          submission: {
            proposal: {
              item_id: 'aaaa1111-2222-4333-8444-555566667777',
              field: 'proposal',
              content_type: 'application/pdf',
              size_bytes: 1_048_576,
              original_filename: 'proposal-garuda.pdf',
              uploaded_at: '2026-10-27T09:00:00+07:00',
            },
            video: {
              item_id: 'bbbb1111-2222-4333-8444-555566667777',
              field: 'video',
              content_type: 'video/mp4',
              size_bytes: 20_971_520,
              original_filename: 'demo-garuda.mp4',
              uploaded_at: '2026-10-27T09:10:00+07:00',
            },
            repo_url: null,
          },
          finalize_missing: [],
        }
        return HttpResponse.json({ team }, { status: 200 })
      }),
    )

    renderInspector()

    const inventory = await screen.findByTestId('item-inventory')
    const proposalRow = within(inventory).getByTestId('item-row-proposal')
    expect(proposalRow).toHaveTextContent('aaaa1111-2222-4333-8444-555566667777')
    // 3 * 1_048_576 + 344 = 3_146_072 B -> "3.00 MB"
    expect(proposalRow).toHaveTextContent('3.00 MB')

    expect(within(inventory).getByTestId('item-row-video')).toHaveTextContent('demo-garuda.mp4')
  })

  it('documents the three cipher branches, the HMAC, and the KEK wrapping', async () => {
    signInAs('budi@mahasiswa.ac.id')
    renderInspector()

    const specs = await screen.findByTestId('cipher-spec-table')

    const aes = within(specs).getByTestId('cipher-spec-aes')
    expect(aes).toHaveTextContent(/AES-CTR/i)
    expect(aes).toHaveTextContent(/32 byte/i)
    expect(aes).toHaveTextContent(/8 byte/i)

    const des = within(specs).getByTestId('cipher-spec-des')
    expect(des).toHaveTextContent(/DES-CTR/i)
    expect(des).toHaveTextContent(/8 byte/i)
    expect(des).toHaveTextContent(/56 bit/i)

    const rc4 = within(specs).getByTestId('cipher-spec-rc4')
    expect(rc4).toHaveTextContent(/RC4/i)
    expect(rc4).toHaveTextContent(/16 byte/i)
    expect(rc4).toHaveTextContent(/3072/)

    expect(await screen.findByTestId('integrity-spec')).toHaveTextContent(/HMAC-SHA256/i)
    expect(screen.getByTestId('integrity-spec')).toHaveTextContent(/encrypt-then-MAC/i)
    expect(screen.getByTestId('kek-spec')).toHaveTextContent(/AES-256-GCM/i)
    expect(screen.getByTestId('kek-spec')).toHaveTextContent(/KEK/i)
  })

  it('tells the participant when nothing has been encrypted yet', async () => {
    signInAs('terverifikasi@mahasiswa.ac.id')

    server.use(
      http.get('*/api/documents', () =>
        HttpResponse.json(
          { ktp: null, ktm: null, twibbon: null, documents_complete: false },
          { status: 200 },
        ),
      ),
      http.get('*/api/teams/me', () => HttpResponse.json({ team: null }, { status: 200 })),
    )

    renderInspector()

    expect(await screen.findByTestId('inventory-empty-state')).toBeInTheDocument()
    expect(screen.queryByTestId('item-row-ktp')).not.toBeInTheDocument()
  })

  /* ---------------------------------------------------------------------- */
  /* Live "Verify Protection & Integrity"                                   */
  /* ---------------------------------------------------------------------- */

  it('verifies an item by downloading it in full and reporting a client-side SHA-256 checksum', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    serveItemBytes('abc', 'image/jpeg')

    renderInspector()

    const ktpRow = within(await screen.findByTestId('item-inventory')).getByTestId('item-row-ktp')
    await user.click(within(ktpRow).getByTestId('verify-btn-ktp'))

    const result = await screen.findByTestId('verify-result-ktp')
    expect(result).toHaveTextContent(SHA256_OF_ABC)
    // The checksum covers exactly the bytes the server released.
    expect(result).toHaveTextContent(/3 B/)
    expect(screen.queryByTestId('verify-error-ktp')).not.toBeInTheDocument()
  })

  it('requests the item without ?download=1 so verification does not trigger a save', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    const requestedUrls: string[] = []
    const bytes = new TextEncoder().encode('abc')
    server.use(
      http.get('*/api/items/:itemId', ({ request }) => {
        requestedUrls.push(request.url)
        const body = bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ) as ArrayBuffer
        return new HttpResponse(body, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '3' },
        })
      }),
    )

    renderInspector()

    const ktpRow = within(await screen.findByTestId('item-inventory')).getByTestId('item-row-ktp')
    await user.click(within(ktpRow).getByTestId('verify-btn-ktp'))
    await screen.findByTestId('verify-result-ktp')

    expect(requestedUrls).toHaveLength(1)
    expect(requestedUrls[0]).toContain(KTP_ITEM_ID)
    expect(requestedUrls[0]).not.toContain('download=1')
  })

  it('surfaces 500 integrity_error clearly when the server detects tampered ciphertext', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    tamperMockItem(KTP_ITEM_ID, true)

    renderInspector()

    const ktpRow = within(await screen.findByTestId('item-inventory')).getByTestId('item-row-ktp')
    await user.click(within(ktpRow).getByTestId('verify-btn-ktp'))

    const failure = await screen.findByTestId('verify-error-ktp')
    expect(failure).toHaveTextContent(/integrity_error/i)
    expect(failure).toHaveTextContent(/HMAC/i)
    expect(screen.queryByTestId('verify-result-ktp')).not.toBeInTheDocument()
  })

  it('verifies each item independently so one failure does not hide another success', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    tamperMockItem(KTP_ITEM_ID, true)

    renderInspector()

    const inventory = await screen.findByTestId('item-inventory')
    await user.click(within(inventory).getByTestId('verify-btn-ktp'))
    await screen.findByTestId('verify-error-ktp')

    await user.click(within(inventory).getByTestId('verify-btn-ktm'))

    expect(await screen.findByTestId('verify-result-ktm')).toBeInTheDocument()
    expect(screen.getByTestId('verify-error-ktp')).toBeInTheDocument()
  })
})
