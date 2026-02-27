do $$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'public.profiles not found. Skipping volunteer profile fields migration.';
    return;
  end if;

  alter table public.profiles
    add column if not exists volunteer_location text,
    add column if not exists volunteer_status text,
    add column if not exists volunteer_has_car boolean,
    add column if not exists volunteer_languages text[],
    add column if not exists volunteer_skills text[],
    add column if not exists volunteer_availability text[];
end $$;

