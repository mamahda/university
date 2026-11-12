/**
 * Renders an API timestamp (ISO 8601 with offset) in Indonesian locale form.
 * Invalid input falls back to the raw string so a bad value stays inspectable
 * instead of surfacing as "Invalid Date".
 */
export function formatTimestamp(
  iso: string | null,
  style: 'short' | 'medium' | 'long' = 'medium',
): string {
  if (!iso) {
    return '—'
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: style,
    timeStyle: 'short',
  }).format(date)
}
