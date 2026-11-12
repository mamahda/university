import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { seedMockActiveSession } from '../../mocks/handlers'
import { server } from '../../mocks/server'
import { AppRoutes } from '../../router'
import { useAuthStore } from '../../stores/authStore'
import { renderWithProviders } from '../../test/test-utils'

const NEWEST_CONTROLLED_RUN = 'run-controlled-2026-10-26'
const OLDER_CONTROLLED_RUN = 'run-controlled-2026-10-19'

function signInAsAdmin() {
  const sessionUser = seedMockActiveSession('admin@panitia.id')
  if (!sessionUser) {
    throw new Error('Seeded superadmin account missing')
  }
  useAuthStore.getState().setSessionUser(sessionUser)
  return sessionUser
}

function renderBenchmarks() {
  return renderWithProviders(<AppRoutes />, {
    routerProps: { initialEntries: ['/admin/benchmarks'] },
  })
}

/** The dashboard opens on live data; most cases exercise the lab fixtures. */
async function renderControlled() {
  const view = renderBenchmarks()
  await userEvent.selectOptions(await screen.findByTestId('benchmark-source-filter'), 'controlled')
  return view
}

/** Records every benchmark request URL while serving the default fixtures. */
function recordRequests(): string[] {
  const urls: string[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.url.includes('/api/admin/benchmarks')) {
      urls.push(request.url)
    }
  })
  return urls
}

describe('Superadmin benchmark dashboard', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('opens on live data by default', async () => {
    signInAsAdmin()
    renderBenchmarks()

    expect(await screen.findByTestId('benchmark-source-filter')).toHaveValue('live')
  })

  /* ---------------------------------------------------------------------- */
  /* Environment, units and the measurement table                           */
  /* ---------------------------------------------------------------------- */

  it('describes the environment of the active run', async () => {
    signInAsAdmin()
    await renderControlled()

    const env = await screen.findByTestId('benchmark-env')
    expect(env).toHaveTextContent('Mock CPU (AES-NI Enabled)')
    expect(env).toHaveTextContent('3.12.4')
    expect(env).toHaveTextContent('Tersedia')
    expect(env).toHaveTextContent('Windows 11 (10.0.26200)')
    expect(env).toHaveTextContent('30 / 3 per cipher dan ukuran')
    expect(env).toHaveTextContent('AES: 256-bit · nonce 8 B · HMAC-SHA256')
    expect(env).toHaveTextContent('RC4: 128-bit · nonce 0 B · drop 3072 B · HMAC-SHA256')
    expect(env).toHaveTextContent('512 KiB, 2 MiB, 5 MiB')

    // The run's own sample total, kept apart from the per-point n.
    const activeRun = screen.getByTestId('benchmark-active-run')
    expect(activeRun).toHaveTextContent(NEWEST_CONTROLLED_RUN)
    expect(activeRun).toHaveTextContent('1350 sampel')
  })

  it('reports durations in microseconds and payload sizes in binary units', async () => {
    signInAsAdmin()
    await renderControlled()

    const table = await screen.findByTestId('benchmark-table')
    const row = within(table).getByTestId('benchmark-row-aes-enc-5242880')

    // 826.4 MB/s over 5 MiB is 6_344_240 ns, i.e. 6344 µs, with the quartiles
    // of the raw samples at 6154 µs and 6661 µs.
    expect(row).toHaveTextContent('5 MiB')
    expect(row).toHaveTextContent('6344')
    expect(row).toHaveTextContent('6154')
    expect(row).toHaveTextContent('6661')
    // Throughput carries its own interquartile range, not the inverted durations.
    expect(row).toHaveTextContent('826.4')
    expect(row).toHaveTextContent('793.3')
    expect(row).toHaveTextContent('851.2')

    expect(within(table).getByTestId('benchmark-row-des-enc-5242880')).toHaveTextContent('54.1')
    expect(within(table).getByTestId('benchmark-row-aes-enc-524288')).toHaveTextContent('512 KiB')
  })

  it('labels the unit each number follows in the table itself', async () => {
    signInAsAdmin()
    await renderControlled()

    const table = await screen.findByTestId('benchmark-table')
    expect(within(table).getByRole('columnheader', { name: 'Median (µs)' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: /IQR.*µs/ })).toBeInTheDocument()
    expect(within(table).getByTestId('benchmark-row-aes-enc-524288')).toHaveTextContent('512 KiB')
    expect(within(table).getByTestId('benchmark-row-aes-enc-524288')).toHaveTextContent(/MB\/s/)
  })

  it('marks a measurement that has not reached thirty samples', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    await user.selectOptions(screen.getByTestId('benchmark-source-filter'), 'live')

    // Live decryption of 2 MiB has only 12 samples so far.
    const scarce = await waitFor(() =>
      within(screen.getByTestId('benchmark-table')).getByTestId(
        'benchmark-row-aes-dec-2097152',
      ),
    )
    expect(within(scarce).getByTestId('benchmark-insufficient')).toHaveTextContent(
      /sampel belum cukup/i,
    )

    const sufficient = within(screen.getByTestId('benchmark-table')).getByTestId(
      'benchmark-row-aes-enc-2097152',
    )
    expect(within(sufficient).queryByTestId('benchmark-insufficient')).not.toBeInTheDocument()
  })

  it('shows key wrapping as a duration without a throughput chart', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    await user.selectOptions(screen.getByTestId('benchmark-operation-filter'), 'wrap')

    await screen.findByTestId('benchmark-chart-unavailable')
    expect(screen.queryByTestId('benchmark-chart')).not.toBeInTheDocument()

    const row = within(screen.getByTestId('benchmark-table')).getByTestId(
      'benchmark-row-aes-wrap-5242880',
    )
    // A fixed 9_400 ns cost, and no MB/s at all.
    expect(row).toHaveTextContent('9.40')
    expect(row).toHaveTextContent('—')
    expect(row).not.toHaveTextContent('MB/s')
  })

  /* ---------------------------------------------------------------------- */
  /* Throughput chart                                                       */
  /* ---------------------------------------------------------------------- */

  it('plots one throughput panel per operation, with an interquartile whisker', async () => {
    signInAsAdmin()
    await renderControlled()

    const chart = await screen.findByTestId('benchmark-chart')
    expect(within(chart).getByTestId('benchmark-chart-panel-enc')).toBeInTheDocument()
    expect(within(chart).getByTestId('benchmark-chart-panel-dec')).toBeInTheDocument()
    expect(within(chart).getByTestId('benchmark-chart-panel-hmac')).toBeInTheDocument()
    // Key wrapping has no meaningful throughput, so it never gets a panel.
    expect(within(chart).queryByTestId('benchmark-chart-panel-wrap')).not.toBeInTheDocument()

    const encPanel = within(chart).getByTestId('benchmark-chart-panel-enc')
    expect(encPanel).toHaveTextContent(/Q1–Q3/)
    // Three payload sizes on a logarithmic axis, for each of the three ciphers.
    for (const size of [524_288, 2_097_152, 5_242_880]) {
      expect(
        within(encPanel).getByTestId(`benchmark-chart-point-enc-aes-${size}`),
      ).toBeInTheDocument()
    }
    expect(encPanel).toHaveTextContent(/logaritmik/i)
  })

  it('identifies each cipher in writing, not by colour alone', async () => {
    signInAsAdmin()
    await renderControlled()

    const legend = await screen.findByTestId('benchmark-chart-legend')
    expect(legend).toHaveTextContent('AES-CTR')
    expect(legend).toHaveTextContent('DES-CTR')
    expect(legend).toHaveTextContent('RC4')

    // The lines are labelled at their end too.
    const encPanel = screen.getByTestId('benchmark-chart-panel-enc')
    expect(encPanel).toHaveTextContent('AES-CTR')
    expect(encPanel).toHaveTextContent('DES-CTR')
    expect(encPanel).toHaveTextContent('RC4')
  })

  it('reveals the full measurement of a point on hover', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    await renderControlled()

    const encPanel = await screen.findByTestId('benchmark-chart-panel-enc')
    expect(within(encPanel).queryByTestId('benchmark-chart-tooltip')).not.toBeInTheDocument()

    await user.hover(within(encPanel).getByTestId('benchmark-chart-point-enc-aes-5242880'))

    const tooltip = await within(encPanel).findByTestId('benchmark-chart-tooltip')
    expect(tooltip).toHaveTextContent('AES-CTR')
    expect(tooltip).toHaveTextContent('5 MiB')
    expect(tooltip).toHaveTextContent('826')
    expect(tooltip).toHaveTextContent('n = 30')
  })

  /* ---------------------------------------------------------------------- */
  /* Source, operation and run selection                                    */
  /* ---------------------------------------------------------------------- */

  it('filters the rows by operation through the API', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    const urls = recordRequests()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    await user.selectOptions(screen.getByTestId('benchmark-operation-filter'), 'dec')

    await waitFor(() => {
      expect(urls.at(-1)).toContain('operation=dec')
    })
  })

  it('lists the runs of the selected source and loads the chosen one', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    const urls = recordRequests()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    const runFilter = screen.getByTestId('benchmark-run-filter')
    expect(within(runFilter).getAllByRole('option')).toHaveLength(3)

    await user.selectOptions(runFilter, OLDER_CONTROLLED_RUN)

    await waitFor(() => {
      expect(urls.at(-1)).toContain(`run_id=${OLDER_CONTROLLED_RUN}`)
    })
    // The older run measured one payload size at a lower throughput.
    const table = await screen.findByTestId('benchmark-table')
    await waitFor(() => {
      expect(within(table).getByTestId('benchmark-row-aes-enc-5242880')).toHaveTextContent('790.2')
    })
  })

  it('drops the chosen run when the source changes', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    const urls = recordRequests()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    const runFilter = screen.getByTestId('benchmark-run-filter')
    await user.selectOptions(runFilter, OLDER_CONTROLLED_RUN)
    await waitFor(() => {
      expect(urls.at(-1)).toContain(`run_id=${OLDER_CONTROLLED_RUN}`)
    })

    await user.selectOptions(screen.getByTestId('benchmark-source-filter'), 'live')

    await waitFor(() => {
      const lastUrl = urls.at(-1) ?? ''
      expect(lastUrl).toContain('source=live')
      expect(lastUrl).not.toContain('run_id')
    })
    expect(runFilter).toHaveValue('')
  })

  it('refetches the active run on demand', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    const urls = recordRequests()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    const before = urls.length

    await user.click(screen.getByTestId('benchmark-refresh-btn'))

    await waitFor(() => {
      expect(urls.length).toBeGreaterThan(before)
    })
  })

  /* ---------------------------------------------------------------------- */
  /* Empty state and errors                                                 */
  /* ---------------------------------------------------------------------- */

  it('uses the contract wording when the run has no samples for an operation', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    await user.selectOptions(screen.getByTestId('benchmark-run-filter'), OLDER_CONTROLLED_RUN)
    await user.selectOptions(screen.getByTestId('benchmark-operation-filter'), 'wrap')

    const empty = await screen.findByTestId('benchmark-empty-state')
    expect(empty).toHaveTextContent('Belum ada data benchmark')
    expect(screen.queryByTestId('benchmark-table')).not.toBeInTheDocument()
  })

  it('explains a run that no longer exists on the selected source', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    await renderControlled()

    await screen.findByTestId('benchmark-table')
    server.use(
      http.get('*/api/admin/benchmarks', () =>
        HttpResponse.json(
          { error: { code: 'not_found', message: 'Run tidak ditemukan.' } },
          { status: 404 },
        ),
      ),
    )

    await user.selectOptions(screen.getByTestId('benchmark-run-filter'), OLDER_CONTROLLED_RUN)

    expect(await screen.findByTestId('benchmark-error')).toHaveTextContent(
      /Run yang dipilih tidak ada pada sumber ini/i,
    )
  })

  it('explains a run whose environment metadata is inconsistent', async () => {
    signInAsAdmin()
    server.use(
      http.get('*/api/admin/benchmarks', () =>
        HttpResponse.json(
          {
            error: {
              code: 'conflict',
              message: 'Metadata lingkungan tidak konsisten.',
            },
          },
          { status: 409 },
        ),
      ),
    )

    await renderControlled()

    expect(await screen.findByTestId('benchmark-error')).toHaveTextContent(
      /metadata lingkungan yang tidak konsisten/i,
    )
  })

  /* ---------------------------------------------------------------------- */
  /* T_CPU scenario calculator                                              */
  /* ---------------------------------------------------------------------- */

  it('computes T_CPU from the measured throughputs for the default scenario', async () => {
    signInAsAdmin()
    await renderControlled()

    // N=100 items of S=5 MB, reading the largest measured payload:
    // v_AES=826.4, v_DES=54.1, v_RC4=267.4, v_HMAC=438.6 MB/s gives
    //   T = 100 * 5 * (1/826.4 + 1/54.1 + 1/267.4 + 3/438.6) = 15.14 s
    const result = await screen.findByTestId('tcpu-result')
    expect(result).toHaveTextContent('15.14')
  })

  it('recomputes T_CPU when the scenario changes', async () => {
    const user = userEvent.setup()
    signInAsAdmin()
    await renderControlled()

    await screen.findByTestId('tcpu-result')

    const itemCount = screen.getByTestId('tcpu-items-input')
    await user.clear(itemCount)
    await user.type(itemCount, '200')

    // Twice the items is twice the CPU time: 30.27 s.
    expect(await screen.findByTestId('tcpu-result')).toHaveTextContent('30.27')
  })

  it('states the formula and its per-ciphertext HMAC term', async () => {
    signInAsAdmin()
    await renderControlled()

    const formula = await screen.findByTestId('tcpu-formula')
    expect(formula).toHaveTextContent(/v_AES/i)
    expect(formula).toHaveTextContent(/v_DES/i)
    expect(formula).toHaveTextContent(/v_RC4/i)
    expect(formula).toHaveTextContent(/3/)
    expect(formula).toHaveTextContent(/v_HMAC/i)
  })

  it('explains that T_CPU cannot be computed when a cipher has no measurement', async () => {
    signInAsAdmin()
    server.use(
      http.get('*/api/admin/benchmarks', () =>
        HttpResponse.json(
          {
            run_id: 'run-partial',
            source: 'controlled',
            env: null,
            runs: [
              { run_id: 'run-partial', created_at: '2026-10-26T20:15:00+07:00', sample_count: 30 },
            ],
            rows: [
              {
                cipher: 'aes',
                operation: 'enc',
                size_bytes: 5_242_880,
                n: 30,
                median_ns: 6_344_240,
                q1_ns: 6_153_913,
                q3_ns: 6_661_452,
                median_mb_s: 826.4,
                q1_mb_s: 793.3,
                q3_mb_s: 851.2,
                sufficient_samples: true,
              },
            ],
          },
          { status: 200 },
        ),
      ),
    )

    await renderControlled()

    expect(await screen.findByTestId('tcpu-incomplete')).toHaveTextContent(/DES/i)
    expect(screen.queryByTestId('tcpu-result')).not.toBeInTheDocument()
  })
})
