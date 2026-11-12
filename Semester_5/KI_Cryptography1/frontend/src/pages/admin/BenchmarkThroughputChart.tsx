import { useState } from 'react'
import type { BenchmarkOperation, BenchmarkRow, CipherType } from '@/api'
import { WELL } from '@/components/ui/tokens'
import { formatMicroseconds, formatSizeLabel, OPERATION_LABELS } from './benchmarkUnits'

/**
 * Series colours: the brand's sky, amber and magenta, each stepped down into
 * the lightness band that reads on a dark ground. Validated as a three-slot
 * categorical set against this dashboard's chart surface (#0b0d28) — every
 * pair clears the CVD (dE 14.2) and normal-vision (dE 18.5) separation floors,
 * and each mark clears 3:1 contrast. Identity is never colour-alone: the
 * legend and the end labels repeat it in text.
 */
const SERIES_COLOR: Record<CipherType, string> = {
  aes: '#2f9fd0',
  des: '#c97f00',
  rc4: '#c1456b',
}

const SERIES_LABEL: Record<CipherType, string> = {
  aes: 'AES-CTR',
  des: 'DES-CTR',
  rc4: 'RC4',
}

const SURFACE = '#0b0d28'
const GRID = '#23264f'
const CIPHER_ORDER: CipherType[] = ['aes', 'des', 'rc4']

/** Panel geometry, in viewBox units. */
const VB_WIDTH = 680
const VB_HEIGHT = 250
const PAD_LEFT = 58
const PAD_RIGHT = 72
const PAD_TOP = 16
const PAD_BOTTOM = 42
const PLOT_RIGHT = VB_WIDTH - PAD_RIGHT
const PLOT_BOTTOM = VB_HEIGHT - PAD_BOTTOM
/** Vertical room an end label needs before it starts reading as a stack. */
const LABEL_MIN_GAP = 13

interface Point {
  cipher: CipherType
  row: BenchmarkRow
  x: number
  y: number
  yLow: number
  yHigh: number
}

interface HoveredPoint {
  operation: BenchmarkOperation
  point: Point
}

/** Axis ticks at 1, 2 or 5 × 10^n, so the labels stay round numbers. */
function niceTicks(max: number): number[] {
  if (max <= 0) {
    return [0]
  }
  const rawStep = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rawStep)!
  const ticks: number[] = []
  // The last tick must sit at or above the largest value, otherwise a mark
  // would be drawn outside the plot area.
  for (let value = 0; value < max + step; value += step) {
    ticks.push(Number(value.toFixed(6)))
    if (value >= max) {
      break
    }
  }
  return ticks
}

function formatThroughput(value: number): string {
  if (Number.isInteger(value) || value >= 100) {
    return value.toFixed(0)
  }
  return value.toFixed(1)
}

/**
 * One panel per operation: mixing operations into a single plot would make the
 * cipher colour carry two meanings at once. Each panel keeps its own
 * throughput axis because the operations differ by an order of magnitude.
 */
function Panel({
  operation,
  rows,
  hovered,
  onHover,
}: {
  operation: BenchmarkOperation
  rows: BenchmarkRow[]
  hovered: HoveredPoint | null
  onHover: (next: HoveredPoint | null) => void
}) {
  const sizes = [...new Set(rows.map((row) => row.size_bytes))].sort((a, b) => a - b)
  const maxThroughput = Math.max(
    ...rows.map((row) => row.q3_mb_s ?? row.median_mb_s ?? 0),
    ...rows.map((row) => row.median_mb_s ?? 0),
  )
  const ticks = niceTicks(maxThroughput)
  const yMax = ticks[ticks.length - 1]

  // Payload size spans three orders of magnitude, so the x axis is log10.
  const logMin = Math.log10(sizes[0])
  const logMax = Math.log10(sizes[sizes.length - 1])
  const logSpan = logMax - logMin

  function xOf(sizeBytes: number): number {
    if (logSpan === 0) {
      return (PAD_LEFT + PLOT_RIGHT) / 2
    }
    const ratio = (Math.log10(sizeBytes) - logMin) / logSpan
    return PAD_LEFT + ratio * (PLOT_RIGHT - PAD_LEFT)
  }

  function yOf(mbPerSecond: number): number {
    const ratio = yMax === 0 ? 0 : mbPerSecond / yMax
    return PLOT_BOTTOM - ratio * (PLOT_BOTTOM - PAD_TOP)
  }

  const series = CIPHER_ORDER.map((cipher) => {
    const points: Point[] = rows
      .filter((row) => row.cipher === cipher && row.median_mb_s !== null)
      .sort((a, b) => a.size_bytes - b.size_bytes)
      .map((row) => {
        const median = row.median_mb_s as number
        return {
          cipher,
          row,
          x: xOf(row.size_bytes),
          y: yOf(median),
          yLow: yOf(row.q1_mb_s ?? median),
          yHigh: yOf(row.q3_mb_s ?? median),
        }
      })
    return { cipher, points }
  }).filter((entry) => entry.points.length > 0)

  const hoveredPoint = hovered && hovered.operation === operation ? hovered.point : null

  /**
   * Direct end labels only work while the lines separate at the right edge.
   * Where they converge — HMAC runs at the same speed whichever cipher it
   * protects — stacked labels detach from their lines and read as noise, so the
   * panel falls back to the legend alone.
   */
  const endYs = series.map(({ points }) => points[points.length - 1].y).sort((a, b) => a - b)
  const labelsCollide = endYs.some(
    (value, index) => index > 0 && value - endYs[index - 1] < LABEL_MIN_GAP,
  )

  return (
    <figure
      data-testid={`benchmark-chart-panel-${operation}`}
      className={`${WELL} overflow-hidden p-4`}
    >
      <figcaption className="text-sm font-semibold text-ink-2">
        {OPERATION_LABELS[operation]}
        <span className="ml-2 text-xs font-normal text-ink-3">
          throughput median (MB/s) terhadap ukuran payload; batang vertikal = Q1–Q3
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
        className="mt-2 w-full"
        role="img"
        aria-label={`Throughput ${OPERATION_LABELS[operation]} per cipher terhadap ukuran payload. Nilai lengkapnya tersedia pada tabel hasil pengukuran.`}
      >
        {/* Gridlines and the throughput axis */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={PLOT_RIGHT}
              y1={yOf(tick)}
              y2={yOf(tick)}
              stroke={GRID}
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={yOf(tick) + 4}
              textAnchor="end"
              className="fill-ink-3 text-[11px] tabular-nums"
            >
              {formatThroughput(tick)}
            </text>
          </g>
        ))}
        {/* Payload size axis, log scale */}
        <line
          x1={PAD_LEFT}
          x2={PLOT_RIGHT}
          y1={PLOT_BOTTOM}
          y2={PLOT_BOTTOM}
          stroke={GRID}
          strokeWidth={1}
        />
        {sizes.map((sizeBytes) => (
          <text
            key={sizeBytes}
            x={xOf(sizeBytes)}
            y={PLOT_BOTTOM + 18}
            textAnchor="middle"
            className="fill-ink-3 text-[11px] tabular-nums"
          >
            {formatSizeLabel(sizeBytes)}
          </text>
        ))}
        <text
          x={(PAD_LEFT + PLOT_RIGHT) / 2}
          y={VB_HEIGHT - 6}
          textAnchor="middle"
          className="fill-ink-3 text-[10px]"
        >
          Ukuran payload (skala logaritmik)
        </text>

        {series.map(({ cipher, points }) => (
          <g key={cipher}>
            {/* Interquartile range of the per-sample throughput. The caps keep
                the range readable where the spread is only a few pixels. */}
            {points.map((point) => (
              <g key={`iqr-${point.row.size_bytes}`} stroke={SERIES_COLOR[cipher]} strokeWidth={2}>
                <line x1={point.x} x2={point.x} y1={point.yLow} y2={point.yHigh} />
                <line x1={point.x - 4} x2={point.x + 4} y1={point.yLow} y2={point.yLow} />
                <line x1={point.x - 4} x2={point.x + 4} y1={point.yHigh} y2={point.yHigh} />
              </g>
            ))}

            {points.length > 1 ? (
              <polyline
                points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke={SERIES_COLOR[cipher]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            {points.map((point) => (
              <circle
                key={`dot-${point.row.size_bytes}`}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={SERIES_COLOR[cipher]}
                stroke={SURFACE}
                strokeWidth={2}
              />
            ))}

            {/* Direct label at the line end; the legend repeats it. */}
            {labelsCollide ? null : (
              <text
                x={points[points.length - 1].x + 10}
                y={points[points.length - 1].y + 4}
                className="fill-ink-2 text-[11px] font-medium"
              >
                {SERIES_LABEL[cipher]}
              </text>
            )}

            {/* Hit targets, wider than the marks themselves */}
            {points.map((point) => (
              <circle
                key={`hit-${point.row.size_bytes}`}
                data-testid={`benchmark-chart-point-${operation}-${cipher}-${point.row.size_bytes}`}
                cx={point.x}
                cy={point.y}
                r={11}
                fill="transparent"
                onMouseEnter={() => onHover({ operation, point })}
                onMouseLeave={() => onHover(null)}
              >
                <title>
                  {`${SERIES_LABEL[cipher]} ${formatSizeLabel(point.row.size_bytes)}: ${formatThroughput(point.row.median_mb_s as number)} MB/s (n=${point.row.n})`}
                </title>
              </circle>
            ))}
          </g>
        ))}

        {hoveredPoint ? <Tooltip point={hoveredPoint} /> : null}
      </svg>
    </figure>
  )
}

const TOOLTIP_WIDTH = 214
const TOOLTIP_HEIGHT = 86

function Tooltip({ point }: { point: Point }) {
  const { row, cipher } = point
  const x = Math.min(Math.max(point.x - TOOLTIP_WIDTH / 2, 4), VB_WIDTH - TOOLTIP_WIDTH - 4)
  const flipBelow = point.y - TOOLTIP_HEIGHT - 14 < 0
  const y = flipBelow ? point.y + 14 : point.y - TOOLTIP_HEIGHT - 14

  return (
    <g data-testid="benchmark-chart-tooltip" pointerEvents="none">
      <rect
        x={x}
        y={y}
        width={TOOLTIP_WIDTH}
        height={TOOLTIP_HEIGHT}
        rx={8}
        fill="#101333"
        stroke="#23264f"
      />
      <circle cx={x + 14} cy={y + 18} r={4} fill={SERIES_COLOR[cipher]} />
      <text x={x + 24} y={y + 22} className="fill-ink text-[12px] font-semibold">
        {SERIES_LABEL[cipher]} · {formatSizeLabel(row.size_bytes)}
      </text>
      <text x={x + 14} y={y + 40} className="fill-ink-2 text-[11px] tabular-nums">
        {formatThroughput(row.median_mb_s as number)} MB/s (Q1–Q3{' '}
        {formatThroughput(row.q1_mb_s ?? (row.median_mb_s as number))}–
        {formatThroughput(row.q3_mb_s ?? (row.median_mb_s as number))})
      </text>
      <text x={x + 14} y={y + 56} className="fill-ink-2 text-[11px] tabular-nums">
        Median {formatMicroseconds(row.median_ns)} µs
      </text>
      <text x={x + 14} y={y + 72} className="fill-ink-3 text-[11px] tabular-nums">
        n = {row.n}
        {row.sufficient_samples ? '' : ' · sampel belum cukup'}
      </text>
    </g>
  )
}

/**
 * Throughput charts for every operation that has one. `wrap` is left out by the
 * caller: its MB/s fields are null by contract, so it has no throughput plot.
 */
export function BenchmarkThroughputChart({ rows }: { rows: BenchmarkRow[] }) {
  const [hovered, setHovered] = useState<HoveredPoint | null>(null)

  const plottable = rows.filter((row) => row.median_mb_s !== null)
  const operations = (['enc', 'dec', 'hmac'] as BenchmarkOperation[]).filter((operation) =>
    plottable.some((row) => row.operation === operation),
  )

  if (operations.length === 0) {
    return null
  }

  return (
    <div data-testid="benchmark-chart" className="space-y-4">
      <ul
        data-testid="benchmark-chart-legend"
        className="flex flex-wrap items-center gap-x-5 gap-y-2"
      >
        {CIPHER_ORDER.filter((cipher) => plottable.some((row) => row.cipher === cipher)).map(
          (cipher) => (
            <li key={cipher} className="flex items-center gap-2 text-sm text-ink-2">
              <span
                aria-hidden="true"
                className="h-0.5 w-5 rounded-full"
                style={{ backgroundColor: SERIES_COLOR[cipher] }}
              />
              {SERIES_LABEL[cipher]}
            </li>
          ),
        )}
      </ul>

      {operations.map((operation) => (
        <Panel
          key={operation}
          operation={operation}
          rows={plottable.filter((row) => row.operation === operation)}
          hovered={hovered}
          onHover={setHovered}
        />
      ))}
    </div>
  )
}
