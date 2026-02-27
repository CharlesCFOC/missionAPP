-- Volunteer document uploads (PDF/PNG/JPEG)

create extension if not exists "pgcrypto";

-- Private bucket for sensitive volunteer documents (IDs, background checks, etc.)
insert into storage.buckets (id, name, public)
values ('volunteer-documents', 'volunteer-documents', false)
on conflict (id) do update
  set name = excluded.name,
      public = excluded.public;

create table if not exists public.volunteer_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  doc_type text not null check (doc_type in ('vulnerability_check', 'id', 'other')),
  title text,
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint,
  uploaded_at timestamptz not null default now()
);

create index if not exists volunteer_documents_user_id_idx
  on public.volunteer_documents(user_id);

create index if not exists volunteer_documents_user_email_idx
  on public.volunteer_documents(user_email);

alter table public.volunteer_documents enable row level security;

drop policy if exists "volunteers_select_own_documents" on public.volunteer_documents;
create policy "volunteers_select_own_documents" on public.volunteer_documents
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "volunteers_insert_own_documents" on public.volunteer_documents;
create policy "volunteers_insert_own_documents" on public.volunteer_documents
for insert to authenticated
with check (
  auth.uid() = user_id
  and user_email = (auth.jwt() ->> 'email')
);

drop policy if exists "volunteers_delete_own_documents" on public.volunteer_documents;
create policy "volunteers_delete_own_documents" on public.volunteer_documents
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "admins_select_all_documents" on public.volunteer_documents;
create policy "admins_select_all_documents" on public.volunteer_documents
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

-- Storage object policies are intentionally managed separately.
-- On some hosted projects, the migration role cannot alter or manage policies on storage.objects
-- (ownership restriction on the storage schema), which would cause `supabase db push` to fail.
-- Bucket creation + table RLS still apply; add Storage policies later via a dedicated script/UI.
