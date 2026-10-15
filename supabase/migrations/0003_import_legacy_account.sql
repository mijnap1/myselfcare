-- Copy journals from the old username-based tables into the new app.
--
-- 1. In the new app, sign up again with the SAME username you used before
--    (any new password).
-- 2. Run this in the SQL editor. Every old account whose username now exists
--    in Supabase Auth gets its data copied over. Safe to re-run.
--
-- New accounts sign in as `<username>@users.jamieryu.com` behind the scenes
-- (see src/lib/auth/username.ts). Inline base64 images in the old data are moved
-- to Storage automatically the first time you open the new app.

insert into public.journal_documents (user_id, data)
select au.id, r.routine
from public.skin_journal_users u
join public.skin_journal_routines r on r.user_id = u.id
join auth.users au on lower(au.email) = u.username || '@users.jamieryu.com'
on conflict (user_id) do update set data = excluded.data;
