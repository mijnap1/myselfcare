/** Only http(s) links are rendered as hrefs, so a stored `javascript:` URL can't run. */
export function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
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
