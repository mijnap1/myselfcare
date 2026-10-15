"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Icon } from "../Icon";

export function AccountBadge({ username, onBeforeSignOut }: { username: string; onBeforeSignOut: () => Promise<void> }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    await onBeforeSignOut();
    // AppRoot switches back to the login screen via onAuthStateChange.
    await getBrowserSupabase().auth.signOut();
  };

  return (
    <div className="auth-status">
      <div className="auth-user">
        <span className="auth-user-icon" aria-hidden="true">
          <Icon name="person-outline" />
        </span>
        <div className="auth-user-copy">
          <p className="auth-user-label">Signed in</p>
          <p className="auth-user-email">{username}</p>
        </div>
      </div>
      <button
        id="logoutButton"
        className="button button-secondary"
        type="button"
        disabled={isSigningOut}
        onClick={handleLogout}
      >
        <Icon name="log-out-outline" />
        <span>로그아웃</span>
      </button>
    </div>
  );
}
