import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  /** Signed-in controls (account badge, logout). */
  account?: ReactNode;
  /** Extra buttons next to the theme toggle (settings menu). */
  actions?: ReactNode;
  status?: ReactNode;
  /** Today's date stamp on the left page, once signed in. */
  dateline?: ReactNode;
  /** The right page of the notebook (today's note card and lined page), once signed in. */
  greeting?: ReactNode;
}

const RINGS = [0, 1, 2];

/** The header is an open binder: the title on the left page, today's page on the right. */
export function Header({ account, actions, status, dateline, greeting }: HeaderProps) {
  return (
    <header className="hero">
      <div className="hero-bar">
        <div className="hero-topline">
          <span className="app-mark" aria-hidden="true">
            <Icon name="book" />
          </span>
          <p className="eyebrow">Beauty, Body &amp; Style</p>
        </div>
        <div className="hero-actions">
          {status}
          {account}
          <div className="header-buttons">
            <ThemeToggle />
            {actions}
          </div>
        </div>
      </div>

      <div className={`notebook${greeting ? " is-spread" : ""}`}>
        <div className="notebook-page notebook-left">
          {dateline}
          <div className="hero-main">
            <h1>
              My <mark>Self</mark> Care
            </h1>
            <p className="hero-copy">
              스킨, 바디, 스타일 기록을 한곳에 정리하고 내 자기관리 흐름을 가볍게 이어가는 퍼스널 셀프케어 저널.
            </p>
          </div>
        </div>
        {greeting && (
          <>
            <div className="notebook-rings" aria-hidden="true">
              {RINGS.map((ring) => (
                <span key={ring} className="notebook-ring" />
              ))}
            </div>
            <div className="notebook-page notebook-right">{greeting}</div>
          </>
        )}
      </div>
    </header>
  );
}
