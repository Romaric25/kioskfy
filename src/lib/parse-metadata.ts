/**
 * Parse metadata from various formats to a Record<string, unknown>
 * Handles string JSON, objects, null, and undefined
 */
export function parseMetadata(
  raw: string | Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!raw) {
    return {};
  }

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  return raw;
}
