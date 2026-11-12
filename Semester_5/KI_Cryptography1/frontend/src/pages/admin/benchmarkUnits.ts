import type { BenchmarkOperation, BenchmarkSource } from '@/api'

/**
 * Units on this dashboard follow the benchmark handoff contract, which mixes
 * two conventions on purpose and asks that the labels say which is which:
 *
 *   - throughput is MB/s with 1 MB = 1_000_000 bytes;
 *   - payload sizes are multiples of 1 MiB = 1_048_576 bytes, so they carry
 *     binary unit labels (KiB/MiB) and never a decimal "MB".
 */
const KIB = 1024
const MIB = 1024 * 1024

export function formatSizeLabel(bytes: number): string {
  if (bytes < KIB) {
    return `${bytes} B`
  }
  if (bytes < MIB) {
    return `${trimZeros(bytes / KIB)} KiB`
  }
  return `${trimZeros(bytes / MIB)} MiB`
}

function trimZeros(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

/**
 * The contract reports durations in microseconds (`median_ns / 1000`). The
 * value is written without a thousands separator so it cannot be misread as a
 * decimal comma or point.
 */
export function formatMicroseconds(nanoseconds: number): string {
  const microseconds = nanoseconds / 1000
  if (microseconds < 10) {
    return microseconds.toFixed(2)
  }
  if (microseconds < 1000) {
    return microseconds.toFixed(1)
  }
  return microseconds.toFixed(0)
}

export const OPERATION_LABELS: Record<BenchmarkOperation, string> = {
  enc: 'Enkripsi',
  dec: 'Dekripsi',
  hmac: 'HMAC-SHA256',
  wrap: 'Pembungkusan kunci',
}

export const SOURCE_LABELS: Record<BenchmarkSource, string> = {
  controlled: 'Terkendali (lab)',
  live: 'Langsung (produksi)',
}
