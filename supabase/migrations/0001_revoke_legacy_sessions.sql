-- Run this NOW in the Supabase SQL editor, before anything else.
--
-- skin_journal_backup.sql (a full pg_dump including session tokens and bcrypt
-- password hashes) was committed to a public GitHub repo. This logs everyone out
-- of the current site so leaked tokens stop working, and removes the
-- username-only password reset function in case it was ever deployed (it let
-- anyone reset any account's password just by knowing the username).
--
-- The current static site keeps working after this; users just sign in again.

delete from public.skin_journal_sessions;

drop function if exists public.skin_journal_reset_password(text, text);
