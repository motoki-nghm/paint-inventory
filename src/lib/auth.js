// src/lib/auth.js
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSupabaseAuth() {
  const enabled = !!supabase;

  const [loading, setLoading] = useState(enabled);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setUser(null);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!alive) return;
        if (error) throw error;
        setUser(data?.session?.user ?? null);
      } catch {
        if (!alive) return;
        setUser(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return { enabled, loading, user, loggedIn: !!user };
}
