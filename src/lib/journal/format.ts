/**
 * Only http(s) links are rendered as hrefs, so a stored `javascript:` URL
 * can't run. A link typed without a scheme ("youtube.com/...") is read as https.
 */
export function safeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeDecimalInput(value: string): string {
  return value
    .trim()
    .replace(",", ".")
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1");
}

export function createId(): string {
  return crypto.randomUUID();
}
