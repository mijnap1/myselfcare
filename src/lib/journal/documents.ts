import type { SupabaseClient } from "@supabase/supabase-js";

export interface JournalDocument {
  data: unknown;
  version: number;
}

const TABLE = "journal_documents";

/** Supabase returns plain error objects; wrap them so messages and stacks survive. */
export class JournalStoreError extends Error {
  readonly code: string;

  constructor(error: { code?: string; message: string }) {
    super(`${error.code ?? "unknown"}: ${error.message}`);
    this.name = "JournalStoreError";
    this.code = error.code ?? "";
  }
}

/** True when migration 0002 hasn't been run yet. */
export function isMissingTableError(error: unknown): boolean {
  return error instanceof JournalStoreError && (error.code === "PGRST205" || error.code === "42P01");
}

export async function fetchJournalDocument(
  supabase: SupabaseClient,
  userId: string
): Promise<JournalDocument | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("data, version")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new JournalStoreError(error);
  }
  return data;
}

/** Loads the user's document, creating an empty one on first sign-in. */
export async function loadOrCreateJournalDocument(
  supabase: SupabaseClient,
  userId: string
): Promise<JournalDocument> {
  const existing = await fetchJournalDocument(supabase, userId);
  if (existing) {
    return existing;
  }

  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, data: {} }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) {
    throw new JournalStoreError(error);
  }

  return (await fetchJournalDocument(supabase, userId)) ?? { data: {}, version: 1 };
}

export type SaveResult = { status: "saved"; version: number } | { status: "conflict" };

/**
 * Saves only if nobody else has saved since `baseVersion`. The database
 * trigger bumps the version, so a stale write matches no rows.
 */
export async function saveJournalDocument(
  supabase: SupabaseClient,
  userId: string,
  baseVersion: number,
  payload: unknown
): Promise<SaveResult> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ data: payload })
    .eq("user_id", userId)
    .eq("version", baseVersion)
    .select("version")
    .maybeSingle();
  if (error) {
    throw new JournalStoreError(error);
  }
  return data ? { status: "saved", version: data.version } : { status: "conflict" };
}
