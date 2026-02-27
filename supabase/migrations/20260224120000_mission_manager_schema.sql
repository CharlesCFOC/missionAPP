-- Mission Manager - Phase 1 schema (Supabase/Postgres)
-- Scope: organizations, missions, projects, team, finance, drive, todo
-- Idempotent migration mirroring the schema already applied manually in Supabase UI.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Utility: updated_at trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'manager_content_status' and n.nspname = 'public'
  ) then
    create type public.manager_content_status as enum ('draft', 'active', 'archived');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'org_membership_role' and n.nspname = 'public'
  ) then
    create type public.org_membership_role as enum (
      'owner',
      'admin',
      'manager',
      'editor',
      'finance',
      'viewer'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'org_membership_status' and n.nspname = 'public'
  ) then
    create type public.org_membership_status as enum ('invited', 'active', 'disabled');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'team_member_role' and n.nspname = 'public'
  ) then
    create type public.team_member_role as enum (
      'leader',
      'volunteer',
      'medical',
      'logistics',
      'pending'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'team_member_status' and n.nspname = 'public'
  ) then
    create type public.team_member_status as enum ('active', 'pending', 'archived');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'finance_entry_type' and n.nspname = 'public'
  ) then
    create type public.finance_entry_type as enum ('income', 'expense');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'manager_scope_type' and n.nspname = 'public'
  ) then
    create type public.manager_scope_type as enum ('organization', 'mission', 'project');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'drive_node_kind' and n.nspname = 'public'
  ) then
    create type public.drive_node_kind as enum ('folder', 'file');
  end if;
end $$;

-- ------------------------------------------------------------
-- Organizations
-- ------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text,
  name text not null,
  tagline text,
  mission_statement text,
  vision_statement text,
  headquarters_city text,
  headquarters_address text,
  contact_email text,
  contact_phone text,
  website text,
  logo_url text,
  cover_image_url text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_not_blank check (slug is null or btrim(slug) <> '')
);

create unique index if not exists organizations_slug_uniq
  on public.organizations (lower(slug))
  where slug is not null;

drop trigger if exists trg_organizations_set_updated_at on public.organizations;
create trigger trg_organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_membership_role not null default 'manager',
  status public.org_membership_status not null default 'active',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_memberships_user_idx
  on public.organization_memberships (user_id);

create index if not exists organization_memberships_org_status_idx
  on public.organization_memberships (organization_id, status);

drop trigger if exists trg_organization_memberships_set_updated_at on public.organization_memberships;
create trigger trg_organization_memberships_set_updated_at
before update on public.organization_memberships
for each row execute function public.set_updated_at();

create table if not exists public.organization_partner_focus (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  href text,
  project_id uuid,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists organization_partner_focus_org_idx
  on public.organization_partner_focus (organization_id, sort_order);

-- ------------------------------------------------------------
-- Missions (rich content)
-- ------------------------------------------------------------
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  legacy_client_id text,
  slug text,
  name text not null,
  country text,
  country_flag text,
  city text,
  cover_image_url text,
  cover_image_storage_path text,
  date_display text,
  start_date date,
  end_date date,
  price_per_person numeric(12,2) not null default 0,
  total_spots integer not null default 0,
  spots_reserved integer not null default 0,
  description text,
  status public.manager_content_status not null default 'draft',
  is_private boolean not null default false,
  white_label_enabled boolean not null default false,
  share_slug text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missions_spots_check check (
    total_spots >= 0 and spots_reserved >= 0 and spots_reserved <= total_spots
  ),
  constraint missions_dates_check check (
    start_date is null or end_date is null or start_date <= end_date
  )
);

create unique index if not exists missions_legacy_client_id_uniq
  on public.missions (legacy_client_id)
  where legacy_client_id is not null;

create unique index if not exists missions_org_slug_uniq
  on public.missions (organization_id, lower(slug))
  where slug is not null;

create unique index if not exists missions_share_slug_uniq
  on public.missions (lower(share_slug))
  where share_slug is not null;

create index if not exists missions_org_status_idx
  on public.missions (organization_id, status);

create index if not exists missions_org_created_idx
  on public.missions (organization_id, created_at desc);

drop trigger if exists trg_missions_set_updated_at on public.missions;
create trigger trg_missions_set_updated_at
before update on public.missions
for each row execute function public.set_updated_at();

create table if not exists public.mission_objectives (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  content text not null
);

create index if not exists mission_objectives_mission_idx
  on public.mission_objectives (mission_id, sort_order);

create table if not exists public.mission_stats (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  label text not null,
  value text not null
);

create index if not exists mission_stats_mission_idx
  on public.mission_stats (mission_id, sort_order);

create table if not exists public.mission_practical_info (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  icon text,
  label text not null,
  value text not null
);

create index if not exists mission_practical_info_mission_idx
  on public.mission_practical_info (mission_id, sort_order);

create table if not exists public.mission_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  day_label text,
  title text not null,
  details text
);

create index if not exists mission_timeline_entries_mission_idx
  on public.mission_timeline_entries (mission_id, sort_order);

create table if not exists public.mission_leaders (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  name text not null,
  role text,
  email text,
  phone text,
  avatar_url text,
  avatar_storage_path text
);

create index if not exists mission_leaders_mission_idx
  on public.mission_leaders (mission_id, sort_order);

create table if not exists public.mission_documents (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  title text not null,
  description text,
  link_url text,
  storage_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists mission_documents_mission_idx
  on public.mission_documents (mission_id, sort_order);

create table if not exists public.mission_testimonials (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  quote text not null,
  author text,
  role text
);

create index if not exists mission_testimonials_mission_idx
  on public.mission_testimonials (mission_id, sort_order);

create table if not exists public.mission_gallery_items (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  sort_order integer not null default 0,
  src_url text not null,
  storage_path text,
  alt_text text,
  file_name text,
  mime_type text,
  size_bytes bigint
);

create index if not exists mission_gallery_items_mission_idx
  on public.mission_gallery_items (mission_id, sort_order);

-- ------------------------------------------------------------
-- Projects (rich content)
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  legacy_client_id text,
  slug text,
  name text not null,
  country text,
  region text,
  summary text,
  beneficiaries text,
  timeline_label text,
  focus text,
  organization_display_name text,
  missionary_name text,
  missionary_role text,
  missionary_image_url text,
  missionary_image_storage_path text,
  missionary_contact_url text,
  description text,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  goal_amount numeric(14,2) not null default 0,
  raised_amount numeric(14,2) not null default 0,
  hero_image_url text,
  hero_image_storage_path text,
  problem_media_url text,
  problem_media_storage_path text,
  problem_summary text,
  problem_points text[] not null default '{}',
  solution_before_media_url text,
  solution_before_media_storage_path text,
  solution_after_media_url text,
  solution_after_media_storage_path text,
  trust_points text[] not null default '{}',
  impact_summary text,
  quiz_copy text,
  testimonials_copy text,
  cta_title text,
  cta_description text,
  cta_primary_label text,
  cta_secondary_label text,
  status public.manager_content_status not null default 'draft',
  is_private boolean not null default false,
  white_label_enabled boolean not null default false,
  share_slug text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists projects_legacy_client_id_uniq
  on public.projects (legacy_client_id)
  where legacy_client_id is not null;

create unique index if not exists projects_org_slug_uniq
  on public.projects (organization_id, lower(slug))
  where slug is not null;

create unique index if not exists projects_share_slug_uniq
  on public.projects (lower(share_slug))
  where share_slug is not null;

create index if not exists projects_org_status_idx
  on public.projects (organization_id, status);

create index if not exists projects_org_created_idx
  on public.projects (organization_id, created_at desc);

drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'organization_partner_focus'
      and constraint_name = 'organization_partner_focus_project_id_fkey'
  ) then
    alter table public.organization_partner_focus
      add constraint organization_partner_focus_project_id_fkey
      foreign key (project_id) references public.projects(id) on delete set null;
  end if;
end $$;

create table if not exists public.project_solution_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order integer not null default 0,
  title text not null,
  detail text
);

create index if not exists project_solution_steps_project_idx
  on public.project_solution_steps (project_id, sort_order);

create table if not exists public.project_impact_stats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order integer not null default 0,
  label text not null,
  value text not null
);

create index if not exists project_impact_stats_project_idx
  on public.project_impact_stats (project_id, sort_order);

create table if not exists public.project_needs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order integer not null default 0,
  name text not null,
  price_amount numeric(14,2) not null default 0
);

create index if not exists project_needs_project_idx
  on public.project_needs (project_id, sort_order);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order integer not null default 0,
  update_date date,
  date_label text,
  title text not null,
  description text,
  image_url text,
  image_storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists project_updates_project_idx
  on public.project_updates (project_id, sort_order);

create table if not exists public.project_gallery_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sort_order integer not null default 0,
  src_url text not null,
  storage_path text,
  alt_text text,
  file_name text,
  mime_type text,
  size_bytes bigint
);

create index if not exists project_gallery_items_project_idx
  on public.project_gallery_items (project_id, sort_order);

-- ------------------------------------------------------------
-- Team (members + assignments to missions/projects)
-- ------------------------------------------------------------
create table if not exists public.organization_team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  linked_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  avatar_url text,
  avatar_storage_path text,
  location text,
  role public.team_member_role not null default 'volunteer',
  status public.team_member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organization_team_members_org_idx
  on public.organization_team_members (organization_id, status);

create index if not exists organization_team_members_linked_user_idx
  on public.organization_team_members (linked_user_id);

create unique index if not exists organization_team_members_org_email_uniq
  on public.organization_team_members (organization_id, lower(email))
  where email is not null;

drop trigger if exists trg_organization_team_members_set_updated_at on public.organization_team_members;
create trigger trg_organization_team_members_set_updated_at
before update on public.organization_team_members
for each row execute function public.set_updated_at();

create table if not exists public.team_member_tasks (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.organization_team_members(id) on delete cascade,
  sort_order integer not null default 0,
  title text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_member_tasks_member_idx
  on public.team_member_tasks (member_id, sort_order);

drop trigger if exists trg_team_member_tasks_set_updated_at on public.team_member_tasks;
create trigger trg_team_member_tasks_set_updated_at
before update on public.team_member_tasks
for each row execute function public.set_updated_at();

create table if not exists public.mission_team_assignments (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  member_id uuid not null references public.organization_team_members(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id) on delete set null,
  unique (mission_id, member_id)
);

create index if not exists mission_team_assignments_member_idx
  on public.mission_team_assignments (member_id);

create table if not exists public.project_team_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null references public.organization_team_members(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id) on delete set null,
  unique (project_id, member_id)
);

create index if not exists project_team_assignments_member_idx
  on public.project_team_assignments (member_id);

-- ------------------------------------------------------------
-- Finance (folders + entries)
-- ------------------------------------------------------------
create table if not exists public.finance_folders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope public.manager_scope_type not null default 'organization',
  mission_id uuid references public.missions(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  files_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_folders_scope_target_check check (
    (scope = 'organization' and mission_id is null and project_id is null) or
    (scope = 'mission' and mission_id is not null and project_id is null) or
    (scope = 'project' and mission_id is null and project_id is not null)
  )
);

create index if not exists finance_folders_org_idx
  on public.finance_folders (organization_id);

create index if not exists finance_folders_mission_idx
  on public.finance_folders (mission_id)
  where mission_id is not null;

create index if not exists finance_folders_project_idx
  on public.finance_folders (project_id)
  where project_id is not null;

drop trigger if exists trg_finance_folders_set_updated_at on public.finance_folders;
create trigger trg_finance_folders_set_updated_at
before update on public.finance_folders
for each row execute function public.set_updated_at();

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.finance_folders(id) on delete cascade,
  category text not null,
  entry_type public.finance_entry_type not null,
  amount numeric(14,2) not null check (amount >= 0),
  currency_code text not null default 'USD',
  notes text,
  receipt_url text,
  receipt_storage_path text,
  occurred_on date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_entries_folder_idx
  on public.finance_entries (folder_id, created_at desc);

create index if not exists finance_entries_type_idx
  on public.finance_entries (entry_type);

drop trigger if exists trg_finance_entries_set_updated_at on public.finance_entries;
create trigger trg_finance_entries_set_updated_at
before update on public.finance_entries
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Drive (folders/files in one tree table)
-- ------------------------------------------------------------
create table if not exists public.drive_nodes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope public.manager_scope_type not null default 'organization',
  mission_id uuid references public.missions(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  parent_id uuid references public.drive_nodes(id) on delete cascade,
  node_kind public.drive_node_kind not null,
  name text not null,
  file_kind text check (file_kind in ('document', 'image', 'video', 'other')),
  mime_type text,
  size_bytes bigint,
  legacy_size_label text,
  preview_url text,
  storage_path text,
  is_storage_object boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drive_nodes_scope_target_check check (
    (scope = 'organization' and mission_id is null and project_id is null) or
    (scope = 'mission' and mission_id is not null and project_id is null) or
    (scope = 'project' and mission_id is null and project_id is not null)
  ),
  constraint drive_nodes_file_fields_check check (
    (node_kind = 'folder') or (node_kind = 'file')
  )
);

create index if not exists drive_nodes_org_idx
  on public.drive_nodes (organization_id);

create index if not exists drive_nodes_parent_idx
  on public.drive_nodes (parent_id, sort_order);

create index if not exists drive_nodes_mission_idx
  on public.drive_nodes (mission_id)
  where mission_id is not null;

create index if not exists drive_nodes_project_idx
  on public.drive_nodes (project_id)
  where project_id is not null;

drop trigger if exists trg_drive_nodes_set_updated_at on public.drive_nodes;
create trigger trg_drive_nodes_set_updated_at
before update on public.drive_nodes
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Todo / Notes (linked to mission/project/org)
-- ------------------------------------------------------------
create table if not exists public.todo_boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope public.manager_scope_type not null default 'organization',
  mission_id uuid references public.missions(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  location text,
  progress_cached numeric(5,2),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint todo_boards_scope_target_check check (
    (scope = 'organization' and mission_id is null and project_id is null) or
    (scope = 'mission' and mission_id is not null and project_id is null) or
    (scope = 'project' and mission_id is null and project_id is not null)
  )
);

create index if not exists todo_boards_org_idx
  on public.todo_boards (organization_id);

create index if not exists todo_boards_mission_idx
  on public.todo_boards (mission_id)
  where mission_id is not null;

create index if not exists todo_boards_project_idx
  on public.todo_boards (project_id)
  where project_id is not null;

drop trigger if exists trg_todo_boards_set_updated_at on public.todo_boards;
create trigger trg_todo_boards_set_updated_at
before update on public.todo_boards
for each row execute function public.set_updated_at();

create table if not exists public.todo_tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.todo_boards(id) on delete cascade,
  sort_order integer not null default 0,
  title text not null,
  completed boolean not null default false,
  deadline_date date,
  category text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todo_tasks_board_idx
  on public.todo_tasks (board_id, sort_order);

create index if not exists todo_tasks_deadline_idx
  on public.todo_tasks (deadline_date)
  where deadline_date is not null;

drop trigger if exists trg_todo_tasks_set_updated_at on public.todo_tasks;
create trigger trg_todo_tasks_set_updated_at
before update on public.todo_tasks
for each row execute function public.set_updated_at();

create table if not exists public.todo_notes (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.todo_boards(id) on delete cascade,
  sort_order integer not null default 0,
  title text not null,
  content text,
  color text default '#ffffff',
  position_x integer not null default 0,
  position_y integer not null default 0,
  pinned boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todo_notes_board_idx
  on public.todo_notes (board_id, sort_order);

drop trigger if exists trg_todo_notes_set_updated_at on public.todo_notes;
create trigger trg_todo_notes_set_updated_at
before update on public.todo_notes
for each row execute function public.set_updated_at();
