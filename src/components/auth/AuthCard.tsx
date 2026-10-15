"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SegmentIndicator } from "@/components/SegmentIndicator";
import {
  MIN_PASSWORD_LENGTH,
  normalizeUsername,
  USERNAME_PATTERN,
  USERNAME_RULE,
  usernameToEmail,
} from "@/lib/auth/username";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Icon } from "../Icon";

type AuthMode = "sign-in" | "sign-up";
type Tone = "" | "error" | "success";

const MODE_COPY: Record<
  AuthMode,
  {
    tab: string;
    kicker: string;
    kickerIcon: string;
    title: string;
    note: string;
    submit: string;
    submitIcon: string;
    switchPrompt: string;
    switchAction: string;
  }
> = {
  "sign-in": {
    tab: "로그인",
    kicker: "Sign in",
    kickerIcon: "log-in-outline",
    title: "다시 오신 걸 환영해요",
    note: "이름과 비밀번호로 로그인하고 기록을 이어가세요.",
    submit: "로그인",
    submitIcon: "log-in-outline",
    switchPrompt: "아직 계정이 없나요?",
    switchAction: "회원가입",
  },
  "sign-up": {
    tab: "회원가입",
    kicker: "Create account",
    kickerIcon: "person-add-outline",
    title: "새 계정 만들기",
    note: "사용할 이름과 비밀번호를 정해 주세요. 비밀번호는 찾을 수 없으니 꼭 기억해 두세요.",
    submit: "계정 만들기",
    submitIcon: "person-add-outline",
    switchPrompt: "이미 계정이 있나요?",
    switchAction: "로그인",
  },
};

// Usernames map to placeholder addresses that can't receive mail, so any
// email-sending error means "Confirm email" is still on in Supabase.
const EMAIL_CONFIRMATION_ON =
  "가입 설정 오류예요. Supabase에서 이메일 확인(Confirm email)을 꺼야 이름으로 가입할 수 있어요.";

const ERROR_MESSAGES: Record<string, string> = {
  over_email_send_rate_limit: EMAIL_CONFIRMATION_ON,
  email_address_invalid: EMAIL_CONFIRMATION_ON,
  email_address_not_authorized: EMAIL_CONFIRMATION_ON,
  email_not_confirmed: "가입이 완료되지 않은 계정이에요. 이 이름으로 다시 회원가입해 주세요.",
  invalid_credentials: "이름 또는 비밀번호가 맞지 않습니다.",
  user_already_exists: "이미 사용 중인 이름입니다.",
  email_exists: "이미 사용 중인 이름입니다.",
  weak_password: `비밀번호가 너무 약해요. ${MIN_PASSWORD_LENGTH}자 이상으로 더 길게 입력해 주세요.`,
  over_request_rate_limit: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
};

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: Tone }>({ text: "", tone: "" });
  const copy = MODE_COPY[mode];
  const isSignUp = mode === "sign-up";

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setPassword("");
    setPasswordConfirm("");
    setMessage({ text: "", tone: "" });
  };

  const showError = (text: string) => setMessage({ text, tone: "error" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = normalizeUsername(username);

    if (isSignUp) {
      if (!USERNAME_PATTERN.test(name)) {
        showError(`이름은 ${USERNAME_RULE}만 사용할 수 있어요.`);
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        showError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`);
        return;
      }
      if (password !== passwordConfirm) {
        showError("비밀번호 확인이 일치하지 않아요.");
        return;
      }
    }

    const supabase = getBrowserSupabase();
    const credentials = { email: usernameToEmail(name), password };
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          ...credentials,
          options: { data: { username: name } },
        });
        if (error) throw error;
        if (!data.session) {
          showError(EMAIL_CONFIRMATION_ON);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
      }

      router.refresh();
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      showError(ERROR_MESSAGES[code] ?? (error instanceof Error ? error.message : "요청을 처리하지 못했어요."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="authCard" className="auth-card card" data-mode={mode}>
      <div key={`copy-${mode}`} className="auth-card-copy auth-mode-swap">
        <p className="section-label auth-mode-label">
          <Icon name={copy.kickerIcon} />
          <span>{copy.kicker}</span>
        </p>
        <h2>{copy.title}</h2>
        <p className="section-note">{copy.note}</p>
      </div>

      <div className="has-segment-indicator auth-tabs" role="tablist" aria-label="Auth mode">
        <SegmentIndicator activeKey={mode} />
        {(["sign-in", "sign-up"] as const).map((tab) => (
          <button
            key={tab}
            className={`auth-tab${mode === tab ? " is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={mode === tab}
            onClick={() => switchMode(tab)}
          >
            <Icon name={MODE_COPY[tab].submitIcon} />
            <span>{MODE_COPY[tab].tab}</span>
          </button>
        ))}
      </div>

      <form key={`form-${mode}`} className="auth-form auth-mode-swap" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>이름</span>
          <input
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={isSignUp ? "사용할 이름 입력" : "이름 입력"}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          {isSignUp && <small className="auth-field-hint">{USERNAME_RULE}</small>}
        </label>
        <label className="auth-field">
          <span>비밀번호</span>
          <input
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? `${MIN_PASSWORD_LENGTH}자 이상` : "비밀번호 입력"}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {isSignUp && (
          <label className="auth-field">
            <span>비밀번호 확인</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 다시 입력"
              required
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
            />
          </label>
        )}
        <button className="button auth-submit" type="submit" disabled={isSubmitting}>
          <Icon name={copy.submitIcon} />
          <span>{isSubmitting ? "잠시만요..." : copy.submit}</span>
        </button>
      </form>

      <p className="auth-switch">
        {copy.switchPrompt}{" "}
        <button
          className="auth-reset-option"
          type="button"
          onClick={() => switchMode(isSignUp ? "sign-in" : "sign-up")}
        >
          {copy.switchAction}
        </button>
      </p>

      <p className={`auth-message${message.tone ? ` ${message.tone}` : ""}`} aria-live="polite">
        {message.text}
      </p>
    </section>
  );
}
