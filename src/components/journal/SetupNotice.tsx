import { Header } from "../Header";
import { Icon } from "../Icon";

/** Shown when the database migration hasn't been run in Supabase yet. */
export function SetupNotice() {
  return (
    <div className="page-shell">
      <Header />
      <section className="auth-card card">
        <div className="auth-card-copy">
          <p className="section-label">
            <Icon name="construct-outline" />
            <span>Setup needed</span>
          </p>
          <h2>데이터베이스 설정이 필요해요</h2>
          <p className="section-note">
            로그인은 됐지만 기록을 저장할 테이블이 아직 없어요. Supabase SQL Editor에서{" "}
            <code>supabase/migrations/0002_journal_documents.sql</code>을 실행한 뒤 새로고침해 주세요.
          </p>
        </div>
      </section>
    </div>
  );
}
