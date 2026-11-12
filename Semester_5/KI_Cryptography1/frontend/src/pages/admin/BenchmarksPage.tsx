import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Calculator, Cpu, Inbox, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import {
  apiClient,
  BENCHMARK_OPERATIONS,
  BENCHMARK_SOURCES,
  isApiClientError,
  type BenchmarkOperation,
  type BenchmarkCipherParameters,
  type BenchmarkRow,
  type BenchmarkSource,
  type CipherType,
} from '@/api'
import {
  BTN_SECONDARY,
  CARD,
  INPUT,
  LABEL,
  PAGE_TITLE,
  RECESSED,
  SECTION_HEADING,
  TD,
  TD_NUM,
  TH,
  TH_NUM,
  WELL,
} from '@/components/ui/tokens'
import { formatTimestamp } from '@/lib/datetime'
import { BenchmarkThroughputChart } from './BenchmarkThroughputChart'
import {
  formatMicroseconds,
  formatSizeLabel,
  OPERATION_LABELS,
  SOURCE_LABELS,
} from './benchmarkUnits'

const CIPHER_LABELS: Record<CipherType, string> = {
  aes: 'AES-CTR',
  des: 'DES-CTR',
  rc4: 'RC4',
}

/** The contract's own threshold: fewer samples carry no statistical weight. */
const SUFFICIENT_SAMPLES = 30

/**
 * One upload is encrypted three times and each ciphertext gets its own HMAC
 * tag, so the HMAC term carries a factor of three while each cipher is paid
 * for once:
 *
 *   T_CPU = N · S · (1/v_AES + 1/v_DES + 1/v_RC4 + 3/v_HMAC)
 *
 * `S` is in MB and each `v` in MB/s, so the result is in seconds.
 */
const HMAC_TAGS_PER_ITEM = 3

interface Throughputs {
  aes: number | null
  des: number | null
  rc4: number | null
  hmac: number | null
}

/**
 * Throughput of the largest measured payload, where the timer overhead no
 * longer dominates; among equally large payloads the most-sampled row wins.
 * Rows without a throughput (`wrap`) are never eligible.
 */
function pickThroughput(
  rows: BenchmarkRow[],
  match: (row: BenchmarkRow) => boolean,
): number | null {
  const candidates = rows.filter((row) => match(row) && row.median_mb_s !== null)
  if (candidates.length === 0) {
    return null
  }
  const best = candidates.reduce((winner, row) =>
    row.size_bytes > winner.size_bytes ||
    (row.size_bytes === winner.size_bytes && row.n > winner.n)
      ? row
      : winner,
  )
  return best.median_mb_s
}

function readThroughputs(rows: BenchmarkRow[]): Throughputs {
  function encThroughput(cipher: CipherType): number | null {
    return pickThroughput(rows, (row) => row.cipher === cipher && row.operation === 'enc')
  }

  return {
    aes: encThroughput('aes'),
    des: encThroughput('des'),
    rc4: encThroughput('rc4'),
    // HMAC-SHA256 does not depend on the cipher branch it protects.
    hmac: pickThroughput(rows, (row) => row.operation === 'hmac'),
  }
}

function computeTCpuSeconds(
  throughputs: Throughputs,
  itemCount: number,
  sizeMb: number,
): number | null {
  const { aes, des, rc4, hmac } = throughputs
  if (!aes || !des || !rc4 || !hmac) {
    return null
  }
  const secondsPerMb = 1 / aes + 1 / des + 1 / rc4 + HMAC_TAGS_PER_ITEM / hmac
  return itemCount * sizeMb * secondsPerMb
}

function describeError(error: unknown): string {
  if (isApiClientError(error)) {
    if (error.status === 404) {
      return 'Run yang dipilih tidak ada pada sumber ini. Pilih run lain atau muat ulang daftarnya.'
    }
    if (error.status === 409) {
      return 'Run ini memuat metadata lingkungan yang tidak konsisten, sehingga sampelnya tidak dapat digabungkan menjadi satu statistik. Jalankan ulang benchmark untuk run tersebut.'
    }
    return error.message
  }
  return 'Gagal memuat hasil benchmark.'
}

function throughputCell(row: BenchmarkRow): string {
  if (row.median_mb_s === null) {
    return '—'
  }
  const range =
    row.q1_mb_s !== null && row.q3_mb_s !== null ? ` (${row.q1_mb_s}–${row.q3_mb_s})` : ''
  return `${row.median_mb_s}${range} MB/s`
}

// Live samples are written by every upload and read, so keep that view fresh.
const LIVE_REFETCH_MS = 5000

function describeParameters(p: BenchmarkCipherParameters): string {
  const parts = [`${p.key_bits}-bit`, `nonce ${p.nonce_bytes} B`]
  if (p.drop_bytes) parts.push(`drop ${p.drop_bytes} B`)
  parts.push(p.hmac ? 'HMAC-SHA256' : 'tanpa HMAC')
  return parts.join(' · ')
}

export function BenchmarksPage() {
  const queryClient = useQueryClient()
  const [source, setSource] = useState<BenchmarkSource>('live')
  const [operation, setOperation] = useState<BenchmarkOperation | ''>('')
  const [runId, setRunId] = useState('')
  const [itemCount, setItemCount] = useState('100')
  const [sizeMb, setSizeMb] = useState('5')

  const refetchInterval = source === 'live' ? LIVE_REFETCH_MS : false

  const tableQuery = useQuery({
    queryKey: ['admin', 'benchmarks', source, operation, runId],
    queryFn: ({ signal }) =>
      apiClient.admin.getBenchmarks(
        { source, ...(operation ? { operation } : {}), ...(runId ? { run_id: runId } : {}) },
        signal,
      ),
    refetchInterval,
  })

  // The scenario always needs the encryption and HMAC passes, so it reads the
  // unfiltered set rather than whatever the table happens to be showing. With
  // no operation filter active this is the table's own query key.
  const scenarioQuery = useQuery({
    queryKey: ['admin', 'benchmarks', source, '', runId],
    queryFn: ({ signal }) =>
      apiClient.admin.getBenchmarks({ source, ...(runId ? { run_id: runId } : {}) }, signal),
    refetchInterval,
  })

  function changeSource(next: BenchmarkSource) {
    setSource(next)
    // Runs belong to one source, so the previous choice cannot carry over.
    setRunId('')
  }

  const rows = tableQuery.data?.rows ?? []
  const env = tableQuery.data?.env ?? null
  const runs = tableQuery.data?.runs ?? []
  const activeRunId = tableQuery.data?.run_id ?? null
  const activeRun = runs.find((run) => run.run_id === activeRunId) ?? null
  const throughputs = readThroughputs(scenarioQuery.data?.rows ?? [])

  const missing = [
    throughputs.aes === null ? 'AES-CTR' : null,
    throughputs.des === null ? 'DES-CTR' : null,
    throughputs.rc4 === null ? 'RC4' : null,
    throughputs.hmac === null ? 'HMAC-SHA256' : null,
  ].filter((label): label is string => label !== null)

  const parsedItemCount = Number(itemCount)
  const parsedSizeMb = Number(sizeMb)
  const scenarioValid =
    Number.isFinite(parsedItemCount) &&
    parsedItemCount > 0 &&
    Number.isFinite(parsedSizeMb) &&
    parsedSizeMb > 0
  const tCpuSeconds = scenarioValid
    ? computeTCpuSeconds(throughputs, parsedItemCount, parsedSizeMb)
    : null

  const hasThroughputRows = rows.some((row) => row.median_mb_s !== null)

  return (
    <div data-testid="admin-benchmarks-page" className="space-y-6">
      <header>
        <h1 className={PAGE_TITLE}>
          Cipher Benchmark Dashboard
        </h1>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                            */}
      {/* ------------------------------------------------------------------ */}

      <section className={`${CARD} p-6`} aria-labelledby="benchmark-filter-heading">
        <h2 id="benchmark-filter-heading" className={SECTION_HEADING}>
          Pilih data
        </h2>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="benchmark-source-filter" className={LABEL}>
              Sumber
            </label>
            <select
              id="benchmark-source-filter"
              data-testid="benchmark-source-filter"
              value={source}
              onChange={(event) => changeSource(event.target.value as BenchmarkSource)}
              className={`mt-1 ${INPUT} sm:w-52`}
            >
              {BENCHMARK_SOURCES.map((value) => (
                <option key={value} value={value}>
                  {SOURCE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="benchmark-operation-filter" className={LABEL}>
              Operasi
            </label>
            <select
              id="benchmark-operation-filter"
              data-testid="benchmark-operation-filter"
              value={operation}
              onChange={(event) => setOperation(event.target.value as BenchmarkOperation | '')}
              className={`mt-1 ${INPUT} sm:w-52`}
            >
              <option value="">Semua operasi</option>
              {BENCHMARK_OPERATIONS.map((value) => (
                <option key={value} value={value}>
                  {OPERATION_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="benchmark-run-filter" className={LABEL}>
              Run
            </label>
            <select
              id="benchmark-run-filter"
              data-testid="benchmark-run-filter"
              value={runId}
              onChange={(event) => setRunId(event.target.value)}
              className={`mt-1 ${INPUT} sm:w-72`}
            >
              <option value="">Run terbaru</option>
              {runs.map((run) => (
                <option key={run.run_id} value={run.run_id}>
                  {formatTimestamp(run.created_at)} — {run.sample_count} sampel
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            data-testid="benchmark-refresh-btn"
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ['admin', 'benchmarks'] })
            }}
            className={BTN_SECONDARY}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Muat ulang
          </button>
        </div>

        {activeRun ? (
          <p data-testid="benchmark-active-run" className="mt-3 text-xs text-ink-3">
            Run aktif <code className="font-mono text-ink-2">{activeRun.run_id}</code>, direkam{' '}
            {formatTimestamp(activeRun.created_at)}, berisi {activeRun.sample_count} sampel untuk
            seluruh operasi, ukuran, dan cipher pada run ini. Jumlah sampel tiap titik ukur ada di
            kolom <strong>n</strong>.
          </p>
        ) : null}
      </section>

      {tableQuery.isError ? (
        <p
          data-testid="benchmark-error"
          role="alert"
          className={`${CARD} flex items-start gap-2 p-6 text-sm text-red-200`}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{describeError(tableQuery.error)}</span>
        </p>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Measurement environment                                            */}
      {/* ------------------------------------------------------------------ */}

      {env ? (
        <section className={`${CARD} p-6`} aria-labelledby="env-heading">
          <h2
            id="env-heading"
            className="flex items-center gap-1.5 text-lg font-semibold text-white"
          >
            <Cpu className="h-4 w-4 text-ink-3" aria-hidden="true" />
            Lingkungan pengukuran
          </h2>
          <dl data-testid="benchmark-env" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
            <div className={`${RECESSED} px-3 py-2 sm:col-span-2`}>
              <dt className="text-xs text-ink-3">CPU</dt>
              <dd className="mt-0.5 text-sm text-ink-2">{env.cpu}</dd>
            </div>
            <div className={`${RECESSED} px-3 py-2`}>
              <dt className="text-xs text-ink-3">AES-NI</dt>
              <dd className="mt-0.5 text-sm text-ink-2">
                {env.aes_ni === null ? 'Tidak terdeteksi' : env.aes_ni ? 'Tersedia' : 'Tidak ada'}
              </dd>
            </div>
            <div className={`${RECESSED} px-3 py-2`}>
              <dt className="text-xs text-ink-3">Sumber</dt>
              <dd className="mt-0.5 text-sm text-ink-2">{SOURCE_LABELS[source]}</dd>
            </div>
            <div className={`${RECESSED} px-3 py-2`}>
              <dt className="text-xs text-ink-3">Python</dt>
              <dd className="mt-0.5 text-sm tabular-nums text-ink-2">{env.python}</dd>
            </div>
            <div className={`${RECESSED} px-3 py-2`}>
              <dt className="text-xs text-ink-3">PyCryptodome</dt>
              <dd className="mt-0.5 text-sm tabular-nums text-ink-2">{env.pycryptodome}</dd>
            </div>
            {env.os ? (
              <div className={`${RECESSED} px-3 py-2 sm:col-span-2`}>
                <dt className="text-xs text-ink-3">Sistem operasi</dt>
                <dd className="mt-0.5 text-sm text-ink-2">{env.os}</dd>
              </div>
            ) : null}
            {env.repeats !== undefined || env.warmup !== undefined ? (
              <div className={`${RECESSED} px-3 py-2 sm:col-span-2`}>
                <dt className="text-xs text-ink-3">Pengulangan / warm-up</dt>
                <dd className="mt-0.5 text-sm tabular-nums text-ink-2">
                  {env.repeats ?? '—'} / {env.warmup ?? '—'} per cipher dan ukuran
                </dd>
              </div>
            ) : null}
            {env.sizes_bytes && env.sizes_bytes.length > 0 ? (
              <div className={`${RECESSED} px-3 py-2 sm:col-span-2`}>
                <dt className="text-xs text-ink-3">Ukuran yang diukur</dt>
                <dd className="mt-0.5 text-sm tabular-nums text-ink-2">
                  {env.sizes_bytes.map((size) => formatSizeLabel(size)).join(', ')}
                </dd>
              </div>
            ) : null}
            {env.protocol ? (
              <div className={`${RECESSED} px-3 py-2 sm:col-span-4`}>
                <dt className="text-xs text-ink-3">Protokol pengukuran</dt>
                <dd className="mt-0.5 text-sm text-ink-2">{env.protocol}</dd>
              </div>
            ) : null}
            {env.parameters ? (
              <div className={`${RECESSED} px-3 py-2 sm:col-span-4`}>
                <dt className="text-xs text-ink-3">Parameter cipher</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(env.parameters).map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded-lg border border-edge bg-field px-2 py-1 font-mono text-xs text-ink-2"
                    >
                      {key.toUpperCase()}: {describeParameters(value)}
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Charts and the measurement table                                   */}
      {/* ------------------------------------------------------------------ */}

      <section className={`${CARD} p-6`} aria-labelledby="rows-heading">
        <h2 id="rows-heading" className={SECTION_HEADING}>
          Hasil pengukuran
        </h2>

        {tableQuery.isPending ? (
          <p data-testid="benchmark-loading" className="mt-3 text-sm text-ink-3">
            Memuat hasil benchmark...
          </p>
        ) : null}

        {tableQuery.isSuccess && rows.length === 0 ? (
          <div
            data-testid="benchmark-empty-state"
            className={`mt-3 ${WELL} flex flex-col items-center gap-2 px-4 py-10 text-center`}
          >
            <Inbox className="h-6 w-6 text-ink-3" aria-hidden="true" />
            <p className="text-sm font-medium text-ink-2">Belum ada data benchmark</p>
            <p className="max-w-md text-sm text-ink-3">
              Operasi ini belum mempunyai sampel pada run terpilih. Jalankan{' '}
              <code className="font-mono text-xs text-ink-2">python benchmark.py</code> untuk
              mengisi sumber terkendali, atau pilih run lain.
            </p>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <>
            {hasThroughputRows ? (
              <div className="mt-4">
                <BenchmarkThroughputChart rows={rows} />
              </div>
            ) : (
              <p
                data-testid="benchmark-chart-unavailable"
                className={`mt-4 ${WELL} px-3 py-2.5 text-sm text-ink-2`}
              >
                Operasi ini tidak mempunyai throughput data yang bermakna, jadi tidak ada grafik
                MB/s. Durasinya tetap terbaca pada tabel di bawah.
              </p>
            )}

            <div className={`mt-4 ${WELL} overflow-x-auto`}>
              <table data-testid="benchmark-table" className="w-full border-collapse">
                <caption className="sr-only">
                  Durasi median, rentang antar-kuartil, dan throughput per cipher, operasi, dan
                  ukuran payload
                </caption>
                <thead>
                  <tr className="border-b border-edge">
                    <th scope="col" className={TH}>
                      Cipher
                    </th>
                    <th scope="col" className={TH}>
                      Operasi
                    </th>
                    <th scope="col" className={TH_NUM}>
                      Ukuran payload
                    </th>
                    <th scope="col" className={TH_NUM}>
                      n
                    </th>
                    <th scope="col" className={TH_NUM}>
                      Median (µs)
                    </th>
                    <th scope="col" className={TH_NUM}>
                      IQR (Q1–Q3, µs)
                    </th>
                    <th scope="col" className={TH_NUM}>
                      Throughput
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={`${row.cipher}-${row.operation}-${row.size_bytes}`}
                      data-testid={`benchmark-row-${row.cipher}-${row.operation}-${row.size_bytes}`}
                      className="border-b border-edge-soft last:border-b-0"
                    >
                      <td className={`${TD} font-medium text-ink`}>
                        {CIPHER_LABELS[row.cipher]}
                      </td>
                      <td className={TD}>{OPERATION_LABELS[row.operation]}</td>
                      <td className={TD_NUM}>{formatSizeLabel(row.size_bytes)}</td>
                      <td className={TD_NUM}>
                        {row.n}
                        {row.sufficient_samples ? null : (
                          <span
                            data-testid="benchmark-insufficient"
                            className="mt-1 flex items-center justify-end gap-1 text-xs font-medium whitespace-nowrap text-amber-200"
                          >
                            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                            Sampel belum cukup (n &lt; {SUFFICIENT_SAMPLES})
                          </span>
                        )}
                      </td>
                      <td className={`${TD_NUM} whitespace-nowrap`}>
                        {formatMicroseconds(row.median_ns)}
                      </td>
                      <td className={`${TD_NUM} whitespace-nowrap`}>
                        {formatMicroseconds(row.q1_ns)}–{formatMicroseconds(row.q3_ns)}
                      </td>
                      <td className={`${TD_NUM} whitespace-nowrap text-ink`}>
                        {throughputCell(row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* T_CPU scenario calculator                                           */}
      {/* ------------------------------------------------------------------ */}

      <section className={`${CARD} p-6`} aria-labelledby="tcpu-heading">
        <h2
          id="tcpu-heading"
          className="flex items-center gap-1.5 text-lg font-semibold text-white"
        >
          <Calculator className="h-4 w-4 text-ink-3" aria-hidden="true" />
          Kalkulator skenario T<sub>CPU</sub>
        </h2>

        <p data-testid="tcpu-formula" className={`mt-3 ${WELL} px-3 py-2.5 text-sm text-ink-2`}>
          <code className="font-mono text-xs break-words text-ink-2">
            T_CPU = N · S · (1/v_AES + 1/v_DES + 1/v_RC4 + 3/v_HMAC)
          </code>
          <span className="mt-1.5 block text-ink-3">
            Setiap unggahan dienkripsi tiga kali dan setiap ciphertext memperoleh tag HMAC-nya
            sendiri, sehingga suku HMAC dikalikan 3 sementara tiap cipher dibayar sekali.
            Throughput diambil dari payload terbesar pada run terpilih.
          </span>
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="tcpu-items-input" className={LABEL}>
              Jumlah item (N)
            </label>
            <input
              id="tcpu-items-input"
              data-testid="tcpu-items-input"
              type="number"
              min={1}
              step={1}
              value={itemCount}
              onChange={(event) => setItemCount(event.target.value)}
              className={`mt-1 ${INPUT}`}
            />
          </div>
          <div>
            <label htmlFor="tcpu-size-input" className={LABEL}>
              Ukuran rata-rata per item (S, MB)
            </label>
            <input
              id="tcpu-size-input"
              data-testid="tcpu-size-input"
              type="number"
              min={0}
              step="any"
              value={sizeMb}
              onChange={(event) => setSizeMb(event.target.value)}
              className={`mt-1 ${INPUT}`}
            />
          </div>
        </div>

        {missing.length > 0 ? (
          <p
            data-testid="tcpu-incomplete"
            className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2.5 text-sm text-amber-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              T<sub>CPU</sub> belum dapat dihitung: belum ada pengukuran untuk {missing.join(', ')}.
            </span>
          </p>
        ) : !scenarioValid ? (
          <p data-testid="tcpu-invalid-scenario" className="mt-3 text-sm text-ink-3">
            Masukkan jumlah item dan ukuran per item yang lebih besar dari nol.
          </p>
        ) : tCpuSeconds !== null ? (
          <div data-testid="tcpu-result" className={`mt-3 ${RECESSED} px-4 py-3`}>
            <p className="text-xs text-ink-3">
              Perkiraan waktu CPU untuk {parsedItemCount} item × {parsedSizeMb} MB
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-white sm:text-3xl">
              {tCpuSeconds.toFixed(2)} s
            </p>
            <p className="mt-1.5 text-xs text-ink-3">
              Berdasarkan v_AES = {throughputs.aes} MB/s, v_DES = {throughputs.des} MB/s, v_RC4 ={' '}
              {throughputs.rc4} MB/s, v_HMAC = {throughputs.hmac} MB/s (sumber:{' '}
              {SOURCE_LABELS[source]}). Angka ini hanya biaya CPU kriptografi, bukan total latensi
              permintaan.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
