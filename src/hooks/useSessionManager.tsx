import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/sessionLogger";

type SessionState = {
  status: "loading" | "authenticated" | "unauthenticated";
  session: any | null;
  user: any | null;
  loginAt: number | null;
  lastRefreshAt: number | null;
};

const SessionContext = createContext<SessionState>({
  status: "loading",
  session: null,
  user: null,
  loginAt: null,
  lastRefreshAt: null,
});

const REFRESH_MARGIN_MS = 2 * 60 * 1000; // refresh 2m before expiry
const KEEP_ALIVE_INTERVAL_MS = 2 * 60 * 1000; // check activity every 2m
const ACTIVE_WINDOW_MS = 5 * 60 * 1000; // activity considered active within 5m

function setSessionCookie(enabled: boolean) {
  try {
    if (!enabled) {
      document.cookie = `nf_session=; Max-Age=0; path=/; SameSite=Lax`;
      return;
    }
    const maxAge = 24 * 60 * 60; // 24h
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `nf_session=active; Max-Age=${maxAge}; path=/; SameSite=Lax${secure}`;
  } catch {}
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading", session: null, user: null, loginAt: null, lastRefreshAt: null });
  const refreshTimer = useRef<number | null>(null);
  const keepAliveTimer = useRef<number | null>(null);
  const lastActivity = useRef<number>(Date.now());

  const clearTimers = () => {
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    if (keepAliveTimer.current) window.clearInterval(keepAliveTimer.current);
    refreshTimer.current = null;
    keepAliveTimer.current = null;
  };

  const scheduleAutoRefresh = (expiresAt?: number | null) => {
    if (!expiresAt) return;
    const msUntilRefresh = Math.max(expiresAt * 1000 - Date.now() - REFRESH_MARGIN_MS, 15_000);
    if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        setState((prev) => ({ ...prev, session: data.session, user: data.session?.user ?? prev.user, lastRefreshAt: Date.now() }));
        setSessionCookie(true);
        logEvent("token_refreshed", data.session?.user?.id, { expires_at: data.session?.expires_at });
        scheduleAutoRefresh(data.session?.expires_at ?? null);
      } catch (err: any) {
        logEvent("error_refresh", state.user?.id, { message: err?.message });
      }
    }, msUntilRefresh);
  };

  const markActivity = () => {
    lastActivity.current = Date.now();
  };

  useEffect(() => {
    // Activity listeners to keep session alive
    const events = ["mousemove", "mousedown", "click", "scroll", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, markActivity, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, markActivity));
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!mounted) return;
      if (session) {
        setState({ status: "authenticated", session, user: session.user, loginAt: Date.now(), lastRefreshAt: null });
        setSessionCookie(true);
        logEvent("session_loaded", session.user?.id, { expires_at: session.expires_at });
        scheduleAutoRefresh(session.expires_at ?? null);
      } else {
        setState({ status: "unauthenticated", session: null, user: null, loginAt: null, lastRefreshAt: null });
        setSessionCookie(false);
        logEvent("session_missing", null);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        clearTimers();
        setState({ status: "unauthenticated", session: null, user: null, loginAt: null, lastRefreshAt: null });
        setSessionCookie(false);
        logEvent("signed_out", null);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setState({ status: "authenticated", session, user: session?.user ?? null, loginAt: state.loginAt ?? Date.now(), lastRefreshAt: event === "TOKEN_REFRESHED" ? Date.now() : state.lastRefreshAt });
        setSessionCookie(true);
        logEvent(event.toLowerCase(), session?.user?.id, { expires_at: session?.expires_at });
        scheduleAutoRefresh(session?.expires_at ?? null);
      }
    });

    // Keep-alive based on activity
    keepAliveTimer.current = window.setInterval(async () => {
      const activeRecently = Date.now() - lastActivity.current < ACTIVE_WINDOW_MS;
      if (activeRecently && state.status === "authenticated") {
        try {
          const { data } = await supabase.auth.getSession();
          const s = data.session;
          if (s?.expires_at && (!state.session || s.expires_at !== state.session.expires_at)) {
            setState((prev) => ({ ...prev, session: s }));
            scheduleAutoRefresh(s.expires_at);
          }
          logEvent("keep_alive", state.user?.id);
          setSessionCookie(true);
        } catch (err: any) {
          logEvent("error_keep_alive", state.user?.id, { message: err?.message });
        }
      }
    }, KEEP_ALIVE_INTERVAL_MS);

    return () => {
      mounted = false;
      clearTimers();
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}