create extension if not exists pgcrypto;

create or replace function public.skin_journal_reset_password(
  p_username text,
  p_password text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := lower(trim(coalesce(p_username, '')));
  v_user_id uuid;
begin
  if length(v_username) < 3 then
    raise exception 'USERNAME_TOO_SHORT';
  end if;

  if length(coalesce(p_password, '')) < 6 then
    raise exception 'PASSWORD_TOO_SHORT';
  end if;

  update public.skin_journal_users
     set password_hash = crypt(p_password, gen_salt('bf')),
         updated_at = now()
   where username = v_username
   returning id into v_user_id;

  if v_user_id is null then
    raise exception 'USER_NOT_FOUND';
  end if;

  delete from public.skin_journal_sessions
   where user_id = v_user_id;

  return true;
end;
$$;

revoke all on function public.skin_journal_reset_password(text, text) from public;
grant execute on function public.skin_journal_reset_password(text, text) to anon;
