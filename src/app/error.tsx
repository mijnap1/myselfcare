"use client";

import { Header } from "@/components/Header";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell">
      <Header />
      <section className="auth-card card">
        <div className="auth-card-copy">
          <h2>기록을 불러오지 못했어요</h2>
          <p className="section-note">잠시 후 다시 시도해 주세요.</p>
        </div>
        <button className="button auth-submit" type="button" onClick={reset}>
          다시 시도
        </button>
      </section>
    </div>
  );
}
