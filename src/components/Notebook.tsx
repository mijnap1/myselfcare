import type { ReactNode } from "react";

interface NotebookProps {
  /** Index tabs on the notebook's edge (signed in only). */
  tabs?: ReactNode;
  /** Today's date on the first page (signed in only). */
  dateline?: ReactNode;
  /** Small facts under the title (signed in only). */
  glance?: ReactNode;
  /** Today's note card and ruled page beside the title (signed in only). */
  greeting?: ReactNode;
  children: ReactNode;
}

/**
 * The whole app is one ring-bound notebook: a pale blue cover, one paper
 * page holding everything, and index tabs for its sections. The page opens
 * with the title (and, once signed in, today's note).
 */
export function Notebook({ tabs, dateline, glance, greeting, children }: NotebookProps) {
  return (
    <div className={`notebook${tabs ? " has-tabs" : ""}`}>
      {tabs}
      <div className="notebook-page">
        <section className={`notebook-intro${greeting ? " has-greeting" : ""}`}>
          <div className="notebook-intro-main">
            {dateline}
            <div className="hero-main">
              <h1>
                My <mark>Self</mark> Care
              </h1>
              <p className="hero-copy">
                스킨, 바디, 스타일 기록을 한곳에 정리하고 내 자기관리 흐름을 가볍게 이어가는 퍼스널 셀프케어 저널.
              </p>
              {glance}
            </div>
          </div>
          {greeting && <div className="notebook-intro-note">{greeting}</div>}
        </section>
        {children}
      </div>
    </div>
  );
}
