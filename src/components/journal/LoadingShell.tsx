import { Header } from "../Header";

export function LoadingShell() {
  return (
    <div className="page-shell">
      <Header />
      <section className="card app-loading" aria-busy="true">
        <p>기록을 불러오는 중...</p>
      </section>
    </div>
  );
}
