import { connection } from "next/server";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Header } from "@/components/Header";
import { JournalLoader } from "@/components/journal/JournalLoader";
import { LoadingShell } from "@/components/journal/LoadingShell";
import { SetupNotice } from "@/components/journal/SetupNotice";
import { emailToUsername } from "@/lib/auth/username";
import { isMissingTableError, loadOrCreateJournalDocument } from "@/lib/journal/documents";
import { createServerSupabase } from "@/lib/supabase/server";

export default function Page() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  // Session checks read the clock (token expiry), so this must run per request.
  await connection();

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    return (
      <div className="page-shell">
        <Header />
        <AuthCard />
      </div>
    );
  }

  let document;
  try {
    document = await loadOrCreateJournalDocument(supabase, userId);
  } catch (error) {
    if (isMissingTableError(error)) {
      return <SetupNotice />;
    }
    throw error;
  }

  return (
    <JournalLoader
      userId={userId}
      username={emailToUsername(typeof data.claims.email === "string" ? data.claims.email : "")}
      initialData={document.data}
      initialVersion={document.version}
    />
  );
}
