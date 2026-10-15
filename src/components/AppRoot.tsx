"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { emailToUsername } from "@/lib/auth/username";
import { isMissingTableError, loadOrCreateJournalDocument } from "@/lib/journal/documents";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AuthCard } from "./auth/AuthCard";
import { Header } from "./Header";
import { JournalApp } from "./journal/JournalApp";
import { LoadingShell } from "./journal/LoadingShell";
import { SetupNotice } from "./journal/SetupNotice";

type AppState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "setup-needed" }
  | { kind: "error" }
  | { kind: "ready"; userId: string; username: string; data: unknown; version: number };

/**
 * Client-side entry point (the site is a static export). Follows the
 * Supabase session and loads the signed-in user's journal.
 */
export function AppRoot() {
  const [state, setState] = useState<AppState>({ kind: "loading" });

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let cancelled = false;
    let loadedUserId = "";

    const load = async (session: Session | null) => {
      if (!session) {
        loadedUserId = "";
        setState({ kind: "signed-out" });
        return;
      }
      // Token refreshes re-send the same session; don't reload the journal.
      if (session.user.id === loadedUserId) return;
      loadedUserId = session.user.id;
      setState({ kind: "loading" });

      try {
        const document = await loadOrCreateJournalDocument(supabase, session.user.id);
        if (cancelled) return;
        setState({
          kind: "ready",
          userId: session.user.id,
          username: emailToUsername(session.user.email ?? ""),
          data: document.data,
          version: document.version,
        });
      } catch (error) {
        if (cancelled) return;
        loadedUserId = "";
        setState({ kind: isMissingTableError(error) ? "setup-needed" : "error" });
      }
    };

    // Fires once with the stored session, then on every sign-in / sign-out.
    // Supabase calls are deferred out of the callback, as its docs recommend.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void load(session), 0);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  switch (state.kind) {
    case "loading":
      return <LoadingShell />;
    case "setup-needed":
      return <SetupNotice />;
    case "signed-out":
      return (
        <div className="page-shell">
          <Header />
          <AuthCard />
        </div>
      );
    case "error":
      return (
        <div className="page-shell">
          <Header />
          <section className="auth-card card">
            <div className="auth-card-copy">
              <h2>기록을 불러오지 못했어요</h2>
              <p className="section-note">인터넷 연결을 확인하고 다시 시도해 주세요.</p>
            </div>
            <button className="button auth-submit" type="button" onClick={() => window.location.reload()}>
              다시 시도
            </button>
          </section>
        </div>
      );
    case "ready":
      return (
        <JournalApp
          key={state.userId}
          userId={state.userId}
          username={state.username}
          initialData={state.data}
          initialVersion={state.version}
        />
      );
  }
}
