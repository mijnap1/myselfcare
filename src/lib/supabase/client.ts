import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

let browserClient: SupabaseClient | null = null;

/** The site is static, so the session lives in the browser (localStorage). */
export function getBrowserSupabase(): SupabaseClient {
  if (!browserClient) {
    const { url, anonKey } = getSupabaseEnv();
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: "my-self-care-auth" },
    });
  }
  return browserClient;
}
