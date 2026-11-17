import { Header } from "../Header";
import { Notebook } from "../Notebook";

export function LoadingShell() {
  return (
    <div className="page-shell">
      <Header />
      <Notebook>
        <section className="card app-loading" aria-busy="true">
          <p>기록을 불러오는 중...</p>
        </section>
      </Notebook>
    </div>
  );
}
