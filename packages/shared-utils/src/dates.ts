export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}-${d.getFullYear()}`;
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diff = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const sign = diffMs <= 0 ? 1 : -1;
  if (diff < 60_000) return rtf.format(sign * Math.floor(diff / 1_000), 'second');
  if (diff < 3_600_000) return rtf.format(sign * Math.floor(diff / 60_000), 'minute');
  if (diff < 86_400_000) return rtf.format(sign * Math.floor(diff / 3_600_000), 'hour');
  return rtf.format(sign * Math.floor(diff / 86_400_000), 'day');
}

export function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function isoWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function daysInPeriod(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00Z');
  const e = new Date(end + 'T00:00:00Z');
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
}
