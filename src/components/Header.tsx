import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  /** Signed-in controls (account badge, logout). */
  account?: ReactNode;
  /** Extra buttons next to the theme toggle (settings menu). */
  actions?: ReactNode;
  status?: ReactNode;
}

export function Header({ account, actions, status }: HeaderProps) {
  return (
    <header className="hero card">
      <div className="hero-main">
        <div className="hero-topline">
          <span className="app-mark" aria-hidden="true">
            <Icon name="sparkles-outline" />
          </span>
          <p className="eyebrow">Beauty, Body &amp; Style</p>
        </div>
        <h1>
          My <mark>Self</mark> Care
        </h1>
        <p className="hero-copy">
          스킨, 바디, 스타일 기록을 한곳에 정리하고 내 자기관리 흐름을 가볍게 이어가는 퍼스널 셀프케어 저널.
        </p>
      </div>
      <div className="hero-actions">
        {account}
        <div className="header-buttons">
          <ThemeToggle />
          {actions}
        </div>
        {status}
      </div>
    </header>
  );
}
