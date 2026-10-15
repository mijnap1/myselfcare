-- Run only after the Next.js version is live and you've imported the old
-- accounts with 0003. Removes the custom username/password system.

drop function if exists public.skin_journal_sign_in(text, text);
drop function if exists public.skin_journal_sign_up(text, text);
drop function if exists public.skin_journal_sign_out(uuid);
drop function if exists public.skin_journal_get_session(uuid);
drop function if exists public.skin_journal_get_routine(uuid);
drop function if exists public.skin_journal_save_routine(uuid, jsonb);
drop function if exists public.skin_journal_strip_inline_images(jsonb);
drop function if exists public.skin_journal_reset_password(text, text);
drop function if exists public.skin_journal_empty_payload();

drop table if exists public.skin_journal_sessions;
drop table if exists public.skin_journal_routines;
drop table if exists public.skin_journal_users;
