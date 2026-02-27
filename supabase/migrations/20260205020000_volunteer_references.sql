-- Volunteer references (contact details for verification)

create extension if not exists "pgcrypto";

create table if not exists public.volunteer_references (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  reference_email text,
  organization text not null,
  phone text,
  contact_person text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists volunteer_references_user_id_idx
  on public.volunteer_references(user_id);

create index if not exists volunteer_references_user_email_idx
  on public.volunteer_references(user_email);

alter table public.volunteer_references enable row level security;

drop policy if exists "volunteers_select_own_references" on public.volunteer_references;
create policy "volunteers_select_own_references" on public.volunteer_references
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "volunteers_insert_own_references" on public.volunteer_references;
create policy "volunteers_insert_own_references" on public.volunteer_references
for insert to authenticated
with check (
  auth.uid() = user_id
  and user_email = (auth.jwt() ->> 'email')
);

drop policy if exists "volunteers_update_own_references" on public.volunteer_references;
create policy "volunteers_update_own_references" on public.volunteer_references
for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and user_email = (auth.jwt() ->> 'email')
);

drop policy if exists "volunteers_delete_own_references" on public.volunteer_references;
create policy "volunteers_delete_own_references" on public.volunteer_references
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "managers_select_all_references" on public.volunteer_references;
create policy "managers_select_all_references" on public.volunteer_references
for select to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in (
        'admin',
        'manager',
        'volunteer manager',
        'volunteer_manager'
      )
  )
);

