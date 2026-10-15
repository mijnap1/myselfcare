-- Schema for the Next.js app (Supabase Auth + RLS).
-- Run in the Supabase SQL editor before deploying the Next.js version.

-- One JSON journal document per auth user.
create table if not exists public.journal_documents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.journal_documents enable row level security;

drop policy if exists "journal_documents_select_own" on public.journal_documents;
create policy "journal_documents_select_own"
  on public.journal_documents for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "journal_documents_insert_own" on public.journal_documents;
create policy "journal_documents_insert_own"
  on public.journal_documents for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "journal_documents_update_own" on public.journal_documents;
create policy "journal_documents_update_own"
  on public.journal_documents for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.journal_documents from anon;
grant select, insert, update on public.journal_documents to authenticated;

-- Every update bumps `version`. The client saves with
-- `update ... where version = <the version it loaded>`, so a save from a stale
-- device matches zero rows instead of silently overwriting newer data.
create or replace function public.journal_documents_bump_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists journal_documents_bump_version on public.journal_documents;
create trigger journal_documents_bump_version
  before update on public.journal_documents
  for each row execute function public.journal_documents_bump_version();

-- Private bucket for product / workout / style images.
-- Objects live under `<user id>/<file>` and only that user can touch them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('journal-images', 'journal-images', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "journal_images_select_own" on storage.objects;
create policy "journal_images_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'journal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "journal_images_insert_own" on storage.objects;
create policy "journal_images_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'journal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "journal_images_delete_own" on storage.objects;
create policy "journal_images_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'journal-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
