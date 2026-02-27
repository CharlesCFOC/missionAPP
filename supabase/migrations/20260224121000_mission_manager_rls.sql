-- Mission Manager RLS (organizations / missions / projects / team / finance / drive / todo)
-- Idempotent migration mirroring policies already applied manually in Supabase UI.

-- ------------------------------------------------------------
-- Helper functions (permission checks)
-- ------------------------------------------------------------
create or replace function public.is_active_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = target_org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

create or replace function public.has_org_role(target_org_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = target_org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role::text = any (allowed_roles)
  );
$$;

create or replace function public.can_manage_org_memberships(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org_id, array['owner','admin']::text[]);
$$;

create or replace function public.can_manage_org_settings(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org_id, array['owner','admin','manager']::text[]);
$$;

create or replace function public.can_edit_org_content(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org_id, array['owner','admin','manager','editor']::text[]);
$$;

create or replace function public.can_manage_org_team(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org_id, array['owner','admin','manager']::text[]);
$$;

create or replace function public.can_manage_org_finance(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_org_role(target_org_id, array['owner','admin','manager','finance']::text[]);
$$;

-- ------------------------------------------------------------
-- Enable RLS on Mission Manager tables
-- ------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_partner_focus enable row level security;

alter table public.missions enable row level security;
alter table public.mission_objectives enable row level security;
alter table public.mission_stats enable row level security;
alter table public.mission_practical_info enable row level security;
alter table public.mission_timeline_entries enable row level security;
alter table public.mission_leaders enable row level security;
alter table public.mission_documents enable row level security;
alter table public.mission_testimonials enable row level security;
alter table public.mission_gallery_items enable row level security;

alter table public.projects enable row level security;
alter table public.project_solution_steps enable row level security;
alter table public.project_impact_stats enable row level security;
alter table public.project_needs enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_gallery_items enable row level security;

alter table public.organization_team_members enable row level security;
alter table public.team_member_tasks enable row level security;
alter table public.mission_team_assignments enable row level security;
alter table public.project_team_assignments enable row level security;

alter table public.finance_folders enable row level security;
alter table public.finance_entries enable row level security;

alter table public.drive_nodes enable row level security;

alter table public.todo_boards enable row level security;
alter table public.todo_tasks enable row level security;
alter table public.todo_notes enable row level security;

-- ------------------------------------------------------------
-- organizations
-- ------------------------------------------------------------
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
for select to authenticated
using (public.is_active_org_member(id));

drop policy if exists organizations_insert on public.organizations;
create policy organizations_insert on public.organizations
for insert to authenticated
with check (
  auth.uid() is not null
  and (created_by is null or created_by = auth.uid())
  and (updated_by is null or updated_by = auth.uid())
);

drop policy if exists organizations_update on public.organizations;
create policy organizations_update on public.organizations
for update to authenticated
using (public.can_manage_org_settings(id))
with check (
  public.can_manage_org_settings(id)
  and (updated_by is null or updated_by = auth.uid())
);

drop policy if exists organizations_delete on public.organizations;
create policy organizations_delete on public.organizations
for delete to authenticated
using (public.can_manage_org_memberships(id));

-- ------------------------------------------------------------
-- organization_memberships
-- ------------------------------------------------------------
drop policy if exists organization_memberships_select on public.organization_memberships;
create policy organization_memberships_select on public.organization_memberships
for select to authenticated
using (
  auth.uid() = user_id
  or public.is_active_org_member(organization_id)
);

drop policy if exists organization_memberships_manage on public.organization_memberships;
create policy organization_memberships_manage on public.organization_memberships
for all to authenticated
using (public.can_manage_org_memberships(organization_id))
with check (public.can_manage_org_memberships(organization_id));

-- ------------------------------------------------------------
-- organization_partner_focus
-- ------------------------------------------------------------
drop policy if exists organization_partner_focus_select on public.organization_partner_focus;
create policy organization_partner_focus_select on public.organization_partner_focus
for select to authenticated
using (public.is_active_org_member(organization_id));

drop policy if exists organization_partner_focus_manage on public.organization_partner_focus;
create policy organization_partner_focus_manage on public.organization_partner_focus
for all to authenticated
using (public.can_edit_org_content(organization_id))
with check (
  public.can_edit_org_content(organization_id)
  and (
    project_id is null
    or exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.organization_id = organization_id
    )
  )
);

-- ------------------------------------------------------------
-- missions
-- ------------------------------------------------------------
drop policy if exists missions_select on public.missions;
create policy missions_select on public.missions
for select to authenticated
using (public.is_active_org_member(organization_id));

drop policy if exists missions_manage on public.missions;
create policy missions_manage on public.missions
for all to authenticated
using (public.can_edit_org_content(organization_id))
with check (public.can_edit_org_content(organization_id));

-- mission child tables (same pattern)
drop policy if exists mission_objectives_select on public.mission_objectives;
create policy mission_objectives_select on public.mission_objectives
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_objectives_manage on public.mission_objectives;
create policy mission_objectives_manage on public.mission_objectives
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

drop policy if exists mission_stats_select on public.mission_stats;
create policy mission_stats_select on public.mission_stats
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_stats_manage on public.mission_stats;
create policy mission_stats_manage on public.mission_stats
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

drop policy if exists mission_practical_info_select on public.mission_practical_info;
create policy mission_practical_info_select on public.mission_practical_info
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_practical_info_manage on public.mission_practical_info;
create policy mission_practical_info_manage on public.mission_practical_info
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

drop policy if exists mission_timeline_entries_select on public.mission_timeline_entries;
create policy mission_timeline_entries_select on public.mission_timeline_entries
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_timeline_entries_manage on public.mission_timeline_entries;
create policy mission_timeline_entries_manage on public.mission_timeline_entries
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

drop policy if exists mission_leaders_select on public.mission_leaders;
create policy mission_leaders_select on public.mission_leaders
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_leaders_manage on public.mission_leaders;
create policy mission_leaders_manage on public.mission_leaders
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

drop policy if exists mission_documents_select on public.mission_documents;
create policy mission_documents_select on public.mission_documents
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_documents_manage on public.mission_documents;
create policy mission_documents_manage on public.mission_documents
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

drop policy if exists mission_testimonials_select on public.mission_testimonials;
create policy mission_testimonials_select on public.mission_testimonials
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_testimonials_manage on public.mission_testimonials;
create policy mission_testimonials_manage on public.mission_testimonials
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

drop policy if exists mission_gallery_items_select on public.mission_gallery_items;
create policy mission_gallery_items_select on public.mission_gallery_items
for select to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_gallery_items_manage on public.mission_gallery_items;
create policy mission_gallery_items_manage on public.mission_gallery_items
for all to authenticated
using (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
)
with check (
  exists (
    select 1 from public.missions m
    where m.id = mission_id
      and public.can_edit_org_content(m.organization_id)
  )
);

-- ------------------------------------------------------------
-- projects
-- ------------------------------------------------------------
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects
for select to authenticated
using (public.is_active_org_member(organization_id));

drop policy if exists projects_manage on public.projects;
create policy projects_manage on public.projects
for all to authenticated
using (public.can_edit_org_content(organization_id))
with check (public.can_edit_org_content(organization_id));

drop policy if exists project_solution_steps_select on public.project_solution_steps;
create policy project_solution_steps_select on public.project_solution_steps
for select to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.is_active_org_member(p.organization_id)
  )
);

drop policy if exists project_solution_steps_manage on public.project_solution_steps;
create policy project_solution_steps_manage on public.project_solution_steps
for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
);

drop policy if exists project_impact_stats_select on public.project_impact_stats;
create policy project_impact_stats_select on public.project_impact_stats
for select to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.is_active_org_member(p.organization_id)
  )
);

drop policy if exists project_impact_stats_manage on public.project_impact_stats;
create policy project_impact_stats_manage on public.project_impact_stats
for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
);

drop policy if exists project_needs_select on public.project_needs;
create policy project_needs_select on public.project_needs
for select to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.is_active_org_member(p.organization_id)
  )
);

drop policy if exists project_needs_manage on public.project_needs;
create policy project_needs_manage on public.project_needs
for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
);

drop policy if exists project_updates_select on public.project_updates;
create policy project_updates_select on public.project_updates
for select to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.is_active_org_member(p.organization_id)
  )
);

drop policy if exists project_updates_manage on public.project_updates;
create policy project_updates_manage on public.project_updates
for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
);

drop policy if exists project_gallery_items_select on public.project_gallery_items;
create policy project_gallery_items_select on public.project_gallery_items
for select to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.is_active_org_member(p.organization_id)
  )
);

drop policy if exists project_gallery_items_manage on public.project_gallery_items;
create policy project_gallery_items_manage on public.project_gallery_items
for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_id
      and public.can_edit_org_content(p.organization_id)
  )
);

-- ------------------------------------------------------------
-- Team
-- ------------------------------------------------------------
drop policy if exists organization_team_members_select on public.organization_team_members;
create policy organization_team_members_select on public.organization_team_members
for select to authenticated
using (public.is_active_org_member(organization_id));

drop policy if exists organization_team_members_manage on public.organization_team_members;
create policy organization_team_members_manage on public.organization_team_members
for all to authenticated
using (public.can_manage_org_team(organization_id))
with check (public.can_manage_org_team(organization_id));

drop policy if exists team_member_tasks_select on public.team_member_tasks;
create policy team_member_tasks_select on public.team_member_tasks
for select to authenticated
using (
  exists (
    select 1
    from public.organization_team_members tm
    where tm.id = member_id
      and public.is_active_org_member(tm.organization_id)
  )
);

drop policy if exists team_member_tasks_manage on public.team_member_tasks;
create policy team_member_tasks_manage on public.team_member_tasks
for all to authenticated
using (
  exists (
    select 1
    from public.organization_team_members tm
    where tm.id = member_id
      and public.can_manage_org_team(tm.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.organization_team_members tm
    where tm.id = member_id
      and public.can_manage_org_team(tm.organization_id)
  )
);

drop policy if exists mission_team_assignments_select on public.mission_team_assignments;
create policy mission_team_assignments_select on public.mission_team_assignments
for select to authenticated
using (
  exists (
    select 1
    from public.missions m
    join public.organization_team_members tm on tm.id = member_id
    where m.id = mission_id
      and tm.organization_id = m.organization_id
      and public.is_active_org_member(m.organization_id)
  )
);

drop policy if exists mission_team_assignments_manage on public.mission_team_assignments;
create policy mission_team_assignments_manage on public.mission_team_assignments
for all to authenticated
using (
  exists (
    select 1
    from public.missions m
    join public.organization_team_members tm on tm.id = member_id
    where m.id = mission_id
      and tm.organization_id = m.organization_id
      and public.can_manage_org_team(m.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.missions m
    join public.organization_team_members tm on tm.id = member_id
    where m.id = mission_id
      and tm.organization_id = m.organization_id
      and public.can_manage_org_team(m.organization_id)
  )
);

drop policy if exists project_team_assignments_select on public.project_team_assignments;
create policy project_team_assignments_select on public.project_team_assignments
for select to authenticated
using (
  exists (
    select 1
    from public.projects p
    join public.organization_team_members tm on tm.id = member_id
    where p.id = project_id
      and tm.organization_id = p.organization_id
      and public.is_active_org_member(p.organization_id)
  )
);

drop policy if exists project_team_assignments_manage on public.project_team_assignments;
create policy project_team_assignments_manage on public.project_team_assignments
for all to authenticated
using (
  exists (
    select 1
    from public.projects p
    join public.organization_team_members tm on tm.id = member_id
    where p.id = project_id
      and tm.organization_id = p.organization_id
      and public.can_manage_org_team(p.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.projects p
    join public.organization_team_members tm on tm.id = member_id
    where p.id = project_id
      and tm.organization_id = p.organization_id
      and public.can_manage_org_team(p.organization_id)
  )
);

-- ------------------------------------------------------------
-- Finance
-- ------------------------------------------------------------
drop policy if exists finance_folders_select on public.finance_folders;
create policy finance_folders_select on public.finance_folders
for select to authenticated
using (public.is_active_org_member(organization_id));

drop policy if exists finance_folders_manage on public.finance_folders;
create policy finance_folders_manage on public.finance_folders
for all to authenticated
using (public.can_manage_org_finance(organization_id))
with check (public.can_manage_org_finance(organization_id));

drop policy if exists finance_entries_select on public.finance_entries;
create policy finance_entries_select on public.finance_entries
for select to authenticated
using (
  exists (
    select 1
    from public.finance_folders ff
    where ff.id = folder_id
      and public.is_active_org_member(ff.organization_id)
  )
);

drop policy if exists finance_entries_manage on public.finance_entries;
create policy finance_entries_manage on public.finance_entries
for all to authenticated
using (
  exists (
    select 1
    from public.finance_folders ff
    where ff.id = folder_id
      and public.can_manage_org_finance(ff.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.finance_folders ff
    where ff.id = folder_id
      and public.can_manage_org_finance(ff.organization_id)
  )
);

-- ------------------------------------------------------------
-- Drive
-- ------------------------------------------------------------
drop policy if exists drive_nodes_select on public.drive_nodes;
create policy drive_nodes_select on public.drive_nodes
for select to authenticated
using (public.is_active_org_member(organization_id));

drop policy if exists drive_nodes_manage on public.drive_nodes;
create policy drive_nodes_manage on public.drive_nodes
for all to authenticated
using (public.can_edit_org_content(organization_id))
with check (public.can_edit_org_content(organization_id));

-- ------------------------------------------------------------
-- Todo
-- ------------------------------------------------------------
drop policy if exists todo_boards_select on public.todo_boards;
create policy todo_boards_select on public.todo_boards
for select to authenticated
using (public.is_active_org_member(organization_id));

drop policy if exists todo_boards_manage on public.todo_boards;
create policy todo_boards_manage on public.todo_boards
for all to authenticated
using (public.can_edit_org_content(organization_id))
with check (public.can_edit_org_content(organization_id));

drop policy if exists todo_tasks_select on public.todo_tasks;
create policy todo_tasks_select on public.todo_tasks
for select to authenticated
using (
  exists (
    select 1
    from public.todo_boards tb
    where tb.id = board_id
      and public.is_active_org_member(tb.organization_id)
  )
);

drop policy if exists todo_tasks_manage on public.todo_tasks;
create policy todo_tasks_manage on public.todo_tasks
for all to authenticated
using (
  exists (
    select 1
    from public.todo_boards tb
    where tb.id = board_id
      and public.can_edit_org_content(tb.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.todo_boards tb
    where tb.id = board_id
      and public.can_edit_org_content(tb.organization_id)
  )
);

drop policy if exists todo_notes_select on public.todo_notes;
create policy todo_notes_select on public.todo_notes
for select to authenticated
using (
  exists (
    select 1
    from public.todo_boards tb
    where tb.id = board_id
      and public.is_active_org_member(tb.organization_id)
  )
);

drop policy if exists todo_notes_manage on public.todo_notes;
create policy todo_notes_manage on public.todo_notes
for all to authenticated
using (
  exists (
    select 1
    from public.todo_boards tb
    where tb.id = board_id
      and public.can_edit_org_content(tb.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.todo_boards tb
    where tb.id = board_id
      and public.can_edit_org_content(tb.organization_id)
  )
);
