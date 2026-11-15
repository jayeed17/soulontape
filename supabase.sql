-- Run once in Supabase → SQL Editor
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  kind        text check (char_length(kind) <= 60),
  event_date  date,
  message     text not null check (char_length(message) between 1 and 5000)
);

alter table public.contact_messages enable row level security;

-- Visitors can only INSERT. No select/update/delete policies, so nobody can read messages
-- with the public key. Read them in the Supabase dashboard (Table Editor).
create policy "public can send messages"
  on public.contact_messages for insert
  to anon
  with check (true);
