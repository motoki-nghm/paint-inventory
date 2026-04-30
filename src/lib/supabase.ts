import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!url || !anon) {
  // Surface in dev tools, but don't throw — let UI handle the empty-config case.
  console.error(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が未設定です",
  );
}

export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  anon || "placeholder",
  {
    auth: {
      // PKCE: secure for SPA. Tokens never leak in URL fragments.
      flowType: "pkce",
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "paint-inventory.auth",
    },
    global: {
      headers: { "x-client-name": "paint-inventory-web" },
    },
  },
);

export const isSupabaseConfigured = !!url && !!anon;
