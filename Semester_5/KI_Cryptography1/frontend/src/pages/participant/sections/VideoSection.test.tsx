import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, type ItemMeta } from '@/api'
import { seedMockActiveSession, setMockTeamStatus } from '@/mocks/handlers'
import { server } from '@/mocks/server'
import { AppRoutes } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { renderWithProviders } from '@/test/test-utils'

const BLOB_URL = 'blob:http://localhost:5173/mock-video-blob'

/** A file whose leading bytes carry a real MP4 `ftyp` box signature. */
function mp4File(name: string, sizeBytes = 2048): File {
  const bytes = new Uint8Array(Math.max(sizeBytes, 16))
  // size prefix, then "ftyp" at offset 4, then the "isom" brand.
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0)
  return new File([bytes], name, { type: 'video/mp4' })
}

/**
 * A file that reports an oversized `size` without allocating it. The size gate
 * runs before any byte is read, so this exercises the real code path.
 */
function oversizedMp4(name: string, sizeBytes: number): File {
  const file = mp4File(name)
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

function videoMeta(overrides: Partial<ItemMeta> = {}): ItemMeta {
  return {
    item_id: 'c1d2e3f4-5555-4666-8777-888899990000',
    field: 'video',
    content_type: 'video/mp4',
    size_bytes: 4096,
    original_filename: 'demo-garuda.mp4',
    uploaded_at: '2026-10-27T09:10:00+07:00',
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

function renderVideoPage() {
  return renderWithProviders(<AppRoutes />, { routerProps: { initialEntries: ['/dashboard'] } })
}

describe('Video Demo Upload & Player', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('tells a participant without a team that there is nothing to upload yet', async () => {
    signInAs('terverifikasi@mahasiswa.ac.id')
    renderVideoPage()

    expect(await screen.findByTestId('video-empty-state')).toBeInTheDocument()
    expect(screen.queryByTestId('file-input-video')).not.toBeInTheDocument()
  })

  /* ---------------------------------------------------------------------- */
  /* MP4 validation (<= 100 MB)                                             */
  /* ---------------------------------------------------------------------- */

  it('rejects a file whose magic bytes are not MP4 without calling the API', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    let uploadCalls = 0
    server.use(
      http.post('*/api/teams/me/video', () => {
        uploadCalls += 1
        return HttpResponse.json(videoMeta(), { status: 201 })
      }),
    )

    renderVideoPage()

    const notAnMp4 = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])], 'demo.mp4', {
      type: 'video/mp4',
    })
    await user.upload(await screen.findByTestId('file-input-video'), notAnMp4)

    expect(await screen.findByTestId('video-error')).toBeInTheDocument()
    expect(uploadCalls).toBe(0)
  })

  it('rejects a video larger than 100 MB without calling the API', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    let uploadCalls = 0
    server.use(
      http.post('*/api/teams/me/video', () => {
        uploadCalls += 1
        return HttpResponse.json(videoMeta(), { status: 201 })
      }),
    )

    renderVideoPage()

    await user.upload(
      await screen.findByTestId('file-input-video'),
      oversizedMp4('demo-besar.mp4', 104_857_601),
    )

    expect(await screen.findByTestId('video-error')).toHaveTextContent(/100(\.00)? MB/i)
    expect(uploadCalls).toBe(0)
  })

  /* ---------------------------------------------------------------------- */
  /* Real-time upload progress (% + MB)                                     */
  /* ---------------------------------------------------------------------- */

  it('reports upload progress as both a percentage and megabytes transferred', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    // MSW's XHR interceptor does not emit upload progress events under jsdom,
    // so the client boundary is stubbed to deliver one deterministic tick.
    const uploadSpy = vi
      .spyOn(apiClient.teams, 'uploadVideo')
      .mockImplementation((_file, options) => {
        options?.onProgress?.({
          loaded: 52_428_800,
          total: 104_857_600,
          fraction: 0.5,
          percent: 50,
        })
        return new Promise(() => {
          // Stay pending so the progress row is still on screen when asserted.
        })
      })

    try {
      renderVideoPage()
      await user.upload(await screen.findByTestId('file-input-video'), mp4File('demo.mp4'))

      const progress = await screen.findByTestId('video-progress')
      expect(progress).toHaveTextContent('50%')
      expect(progress).toHaveTextContent('50.00 MB / 100.00 MB')
      expect(uploadSpy).toHaveBeenCalledTimes(1)
    } finally {
      uploadSpy.mockRestore()
    }
  })

  it('uploads a valid MP4 and shows the stored filename and size', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')
    renderVideoPage()

    await user.upload(
      await screen.findByTestId('file-input-video'),
      mp4File('demo-garuda.mp4', 4096),
    )

    const meta = await screen.findByTestId('video-meta')
    expect(meta).toHaveTextContent('demo-garuda.mp4')
    expect(meta).toHaveTextContent('4.0 KB')
  })

  /* ---------------------------------------------------------------------- */
  /* Error recovery: 413, 415, 409, network error                           */
  /* ---------------------------------------------------------------------- */

  it('recovers from a 413 too_large rejection and succeeds on retry', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    let attempt = 0
    server.use(
      http.post('*/api/teams/me/video', () => {
        attempt += 1
        if (attempt === 1) {
          return HttpResponse.json(
            {
              error: {
                code: 'too_large',
                message: 'Ukuran video melebihi batas 100 MB',
                details: {},
              },
            },
            { status: 413 },
          )
        }
        return HttpResponse.json(videoMeta({ original_filename: 'demo-kecil.mp4' }), {
          status: 201,
        })
      }),
    )

    renderVideoPage()

    const input = await screen.findByTestId('file-input-video')
    await user.upload(input, mp4File('demo-garuda.mp4'))
    expect(await screen.findByTestId('video-error')).toHaveTextContent(/100 MB/i)

    await user.upload(input, mp4File('demo-kecil.mp4'))

    expect(await screen.findByTestId('video-meta')).toHaveTextContent('demo-kecil.mp4')
    expect(screen.queryByTestId('video-error')).not.toBeInTheDocument()
    expect(attempt).toBe(2)
  })

  it('surfaces a 415 unsupported_type rejection from the server', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    server.use(
      http.post('*/api/teams/me/video', () =>
        HttpResponse.json(
          {
            error: {
              code: 'unsupported_type',
              message: 'Video harus berupa file MP4.',
              details: {},
            },
          },
          { status: 415 },
        ),
      ),
    )

    renderVideoPage()
    await user.upload(await screen.findByTestId('file-input-video'), mp4File('demo.mp4'))

    expect(await screen.findByTestId('video-error')).toHaveTextContent(/MP4/i)
  })

  it('surfaces a 409 deadline_passed rejection from the server', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    server.use(
      http.post('*/api/teams/me/video', () =>
        HttpResponse.json(
          {
            error: {
              code: 'deadline_passed',
              message: 'Tenggat pengumpulan karya telah terlewat.',
              details: {},
            },
          },
          { status: 409 },
        ),
      ),
    )

    renderVideoPage()
    await user.upload(await screen.findByTestId('file-input-video'), mp4File('demo.mp4'))

    expect(await screen.findByTestId('video-error')).toHaveTextContent(/Tenggat/i)
  })

  it('surfaces a network error and leaves the input ready for another attempt', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    server.use(http.post('*/api/teams/me/video', () => HttpResponse.error()))

    renderVideoPage()
    await user.upload(await screen.findByTestId('file-input-video'), mp4File('demo.mp4'))

    expect(await screen.findByTestId('video-error')).toHaveTextContent(/jaringan/i)
    expect(screen.getByTestId('file-input-video')).toBeEnabled()
  })

  it('hides the upload control once the team is finalized', async () => {
    signInAs('budi@mahasiswa.ac.id')
    setMockTeamStatus('9c8b7a6d-5e4f-4321-8765-0fedcba98765', 'final')

    renderVideoPage()

    expect(await screen.findByTestId('video-locked-notice')).toBeInTheDocument()
    expect(screen.queryByTestId('file-input-video')).not.toBeInTheDocument()
  })

  /* ---------------------------------------------------------------------- */
  /* Full-blob authenticated playback (createObjectURL + cleanup)            */
  /* ---------------------------------------------------------------------- */

  it('plays the video from a full authenticated blob and revokes the Object URL on unmount', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    const createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => BLOB_URL)
    const revokeObjectUrlSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    try {
      const { unmount } = renderVideoPage()

      await user.upload(
        await screen.findByTestId('file-input-video'),
        mp4File('demo-garuda.mp4', 4096),
      )
      await screen.findByTestId('video-meta')

      await user.click(screen.getByTestId('video-load-btn'))

      const player = await screen.findByTestId('video-player')
      expect(player).toHaveAttribute('src', BLOB_URL)

      const playbackCall = fetchSpy.mock.calls.find(([input]) =>
        String(input).includes('/api/items/'),
      )
      expect(playbackCall).toBeDefined()
      expect(String(playbackCall?.[0])).not.toContain('download=1')
      expect((playbackCall?.[1] as RequestInit | undefined)?.credentials).toBe('include')

      unmount()
      expect(revokeObjectUrlSpy).toHaveBeenCalledWith(BLOB_URL)
    } finally {
      createObjectUrlSpy.mockRestore()
      revokeObjectUrlSpy.mockRestore()
      fetchSpy.mockRestore()
    }
  })

  it('reports a 500 integrity_error instead of playing a tampered video', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    renderVideoPage()
    await user.upload(
      await screen.findByTestId('file-input-video'),
      mp4File('demo-garuda.mp4', 4096),
    )
    await screen.findByTestId('video-meta')

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

    await user.click(screen.getByTestId('video-load-btn'))

    expect(await screen.findByTestId('video-player-error')).toHaveTextContent(/integrity_error/i)
    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument()
  })

  /* ---------------------------------------------------------------------- */
  /* Intact download trigger                                                */
  /* ---------------------------------------------------------------------- */

  it('downloads the intact video with ?download=1 under its original filename', async () => {
    const user = userEvent.setup()
    signInAs('budi@mahasiswa.ac.id')

    const createObjectUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => BLOB_URL)
    const revokeObjectUrlSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined)
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    try {
      renderVideoPage()

      await user.upload(
        await screen.findByTestId('file-input-video'),
        mp4File('demo-garuda.mp4', 4096),
      )
      await screen.findByTestId('video-meta')

      await user.click(screen.getByTestId('video-download-btn'))

      await waitFor(() => {
        expect(anchorClickSpy).toHaveBeenCalled()
      })

      const downloadCall = fetchSpy.mock.calls.find(([input]) =>
        String(input).includes('download=1'),
      )
      expect(downloadCall).toBeDefined()
      expect((downloadCall?.[1] as RequestInit | undefined)?.credentials).toBe('include')

      // The download URL is released on a macrotask so the click is not cancelled.
      await waitFor(() => {
        expect(revokeObjectUrlSpy).toHaveBeenCalledWith(BLOB_URL)
      })
    } finally {
      createObjectUrlSpy.mockRestore()
      revokeObjectUrlSpy.mockRestore()
      fetchSpy.mockRestore()
      anchorClickSpy.mockRestore()
    }
  })

  it('lets a team member who is not the leader watch and download but not upload', async () => {
    signInAs('sari@mahasiswa.ac.id')
    renderVideoPage()

    expect(await screen.findByTestId('video-not-leader-notice')).toBeInTheDocument()
    expect(screen.queryByTestId('file-input-video')).not.toBeInTheDocument()
  })

  it('states the 100 MB MP4 limit before a file is chosen', async () => {
    signInAs('budi@mahasiswa.ac.id')
    renderVideoPage()

    const card = await screen.findByTestId('video-upload-card')
    expect(card).toHaveTextContent(/MP4/i)
    expect(card).toHaveTextContent(/100(\.00)? MB/i)
  })
})
