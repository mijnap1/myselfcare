/**
 * Supabase Auth only supports email/phone sign-in, so each username maps to a
 * placeholder address on a domain we control. Nothing is ever mailed to it —
 * "Confirm email" must be turned off in Supabase (see README).
 */
const AUTH_EMAIL_DOMAIN = "users.jamieryu.com";

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
export const USERNAME_RULE = "영문 소문자, 숫자, _ 로 3–20자";
export const MIN_PASSWORD_LENGTH = 8;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${AUTH_EMAIL_DOMAIN}`;
}

export function emailToUsername(email: string): string {
  const suffix = `@${AUTH_EMAIL_DOMAIN}`;
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
}
