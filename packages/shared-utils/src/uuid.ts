const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function safeCastUuid(val: string | null | undefined): string | null {
  if (!val) return null;
  const cleaned = val.trim();
  if (cleaned.length === 36 && UUID_RE.test(cleaned)) {
    return cleaned;
  }
  return null;
}

export function safeCastUserUuid(val: string | null | undefined): string | null {
  if (!val) return null;
  const cleaned = val.trim();
  if (cleaned.length === 36 && UUID_RE.test(cleaned)) {
    return cleaned;
  }
  if (/^u[0-9]{1,12}$/.test(cleaned)) {
    const digits = cleaned.substring(1);
    const paddedDigits = digits.padStart(12, '0');
    return `00000000-0000-0000-0000-${paddedDigits}`;
  }
  if (cleaned === '') {
    return null;
  }
  return '00000000-0000-0000-0000-000000000000';
}
