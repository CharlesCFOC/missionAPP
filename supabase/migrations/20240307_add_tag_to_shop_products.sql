-- Adds a tag label to each shop product
-- Safe on fresh databases where shop_products may not exist.
do $$
begin
  if to_regclass('public.shop_products') is null then
    raise notice 'public.shop_products not found. Skipping migration.';
    return;
  end if;

  alter table public.shop_products
    add column if not exists tag text;
end $$;
