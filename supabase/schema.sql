-- HOSH database schema for Supabase (Postgres).
-- Run this once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- It is safe to run again: everything uses "if not exists" / "or replace".

create extension if not exists pgcrypto;

-- Reports -------------------------------------------------------------------
create table if not exists public.reports (
  id                  uuid primary key default gen_random_uuid(),
  number_norm         text not null check (char_length(number_norm) between 2 and 20),
  number_display      text not null check (char_length(number_display) between 2 and 32),
  scam_type           text not null check (scam_type in (
                        'courier', 'bank_wallet', 'family_arrest', 'police_govt', 'prize_scheme',
                        'job_fee', 'whatsapp', 'fake_link', 'other')),
  asked               text[] not null check (
                        cardinality(asked) between 1 and 6
                        and asked <@ array['otp', 'money', 'personal_info', 'link', 'app', 'nothing']::text[]),
  loss_band           text not null check (loss_band in ('none', 'under_5k', '5k_25k', '25k_100k', 'over_100k')),
  story               text check (story is null or char_length(story) <= 200),
  lang                text not null default 'en' check (lang in ('en', 'ur')),
  reported_officially boolean,
  flag_count          int not null default 0,
  hidden              boolean not null default false,
  is_sample           boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists reports_number_norm_idx on public.reports (number_norm);
create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_visible_recent_idx on public.reports (created_at desc) where hidden = false;

-- Flags ("Report abuse") -------------------------------------------------------
create table if not exists public.flags (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.reports (id) on delete cascade,
  fingerprint text not null check (char_length(fingerprint) between 8 and 128),
  created_at  timestamptz not null default now(),
  unique (report_id, fingerprint)
);

create index if not exists flags_report_id_idx on public.flags (report_id);

-- Security ----------------------------------------------------------------------
-- RLS on, no policies: the public anon key can do nothing. The app talks to
-- the database only from the server, with the service role key.
alter table public.reports enable row level security;
alter table public.flags enable row level security;

-- Atomic flagging: one flag per fingerprint; the report is hidden when it
-- reaches 3 distinct flags (only on crossing the threshold, so an admin
-- "unhide" is not undone by the next flag).
create or replace function public.flag_report(p_report_id uuid, p_fingerprint text)
returns table (flag_count int, hidden boolean, duplicate boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before   int;
  v_inserted int;
begin
  perform 1 from reports r where r.id = p_report_id for update;
  if not found then
    return;
  end if;

  select count(*) into v_before from flags f where f.report_id = p_report_id;

  insert into flags (report_id, fingerprint) values (p_report_id, p_fingerprint)
  on conflict (report_id, fingerprint) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update reports r
       set flag_count = v_before + 1,
           hidden = case when v_before < 3 and v_before + 1 >= 3 then true else r.hidden end
     where r.id = p_report_id;
  end if;

  return query
    select r.flag_count, r.hidden, (v_inserted = 0) as duplicate
      from reports r
     where r.id = p_report_id;
end;
$$;

revoke all on function public.flag_report(uuid, text) from public, anon, authenticated;
grant execute on function public.flag_report(uuid, text) to service_role;
