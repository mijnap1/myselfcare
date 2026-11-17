import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  /** Signed-in controls (account badge, logout). */
  account?: ReactNode;
  /** Extra buttons next to the theme toggle (settings menu). */
  actions?: ReactNode;
  status?: ReactNode;
}

/** The small bar above the notebook: account and settings, on the right. */
export function Header({ account, actions, status }: HeaderProps) {
  return (
    <header className="desk-bar">
      <div className="desk-actions">
        {status}
        {account}
        <div className="header-buttons">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  );
}
