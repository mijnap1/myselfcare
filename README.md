# My Self Care

Personal skin / body / style journal. Next.js (App Router) + TypeScript, Supabase Auth, Postgres with row-level security, and Supabase Storage for images.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the Supabase URL and anon key
npm run dev
```

Run the SQL in `supabase/migrations/` from the Supabase SQL editor, in order:

| File | When |
| --- | --- |
| `0001_revoke_legacy_sessions.sql` | Immediately. Logs out every session of the old static site. |
| `0002_journal_documents.sql` | Before deploying. Creates the journal table, RLS policies and the `journal-images` bucket. |
| `0003_import_legacy_account.sql` | After re-signing up with your old username. Copies the old account's data to the new one. |
| `0004_drop_legacy_auth.sql` | Once everything is migrated. Removes the old username/password tables and functions. |

### Username login

Users sign in with a username and password. Supabase Auth needs an email, so each username is stored as `<username>@users.jamieryu.com` (see `src/lib/auth/username.ts`); no mail is ever sent there.

In Supabase → Authentication → Sign In / Providers → Email, **turn off "Confirm email"**. Otherwise sign-ups can't log in, and Supabase would try to send confirmation mail to addresses that don't exist.

There's no "forgot password" flow because accounts have no real email. As the project owner you can reset someone's password from the SQL editor:

```sql
update auth.users
set encrypted_password = extensions.crypt('NEW_PASSWORD', extensions.gen_salt('bf'))
where email = 'USERNAME@users.jamieryu.com';
```

## Deploying (Vercel)

Import the repo in Vercel and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables.

## How it works

- `src/app/page.tsx` reads the session on the server and loads the user's `journal_documents` row.
- `src/components/journal/useJournalStore.ts` holds the document, applies edits with immer, and autosaves. Each save is conditional on the `version` it loaded, so a stale tab gets the newer copy instead of overwriting it.
- Images are resized to JPEG in the browser and uploaded to a private bucket under `<user id>/`. Base64 images from the old app are moved there automatically on first load.
- Styles live in `src/styles/` (unchanged from the static site).

```bash
npm run lint
npm run build
```
