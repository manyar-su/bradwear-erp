-- Target project:
-- https://kppsavzargjxtwsljwzi.supabase.co
--
-- Jalankan file ini di Supabase SQL Editor project tersebut.

-- =========================================================
-- 1) Orders table (source data untuk Production Control)
-- =========================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  kode_barang text not null,
  nama_penjahit text,
  model text,
  model_detail text,
  jumlah_pesanan integer default 0,
  status text default 'Proses',
  size_details jsonb default '[]'::jsonb,
  cs text,
  konsumen text,
  warna text,
  tanggal_order text,
  tanggal_target_selesai text,
  saku_type text,
  saku_color text,
  payment_status text,
  priority text,
  deskripsi_pekerjaan text,
  embroidery_status text,
  embroidery_notes text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create or replace function public.set_updated_at_orders()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at_orders();

alter table public.orders enable row level security;

drop policy if exists "orders_select_authenticated" on public.orders;
create policy "orders_select_authenticated"
on public.orders
for select
using (auth.role() = 'authenticated');

drop policy if exists "orders_insert_authenticated" on public.orders;
create policy "orders_insert_authenticated"
on public.orders
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "orders_update_authenticated" on public.orders;
create policy "orders_update_authenticated"
on public.orders
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "orders_delete_authenticated" on public.orders;
create policy "orders_delete_authenticated"
on public.orders
for delete
using (auth.role() = 'authenticated');

-- =========================================================
-- 2) User roles table + trigger untuk default role
-- =========================================================
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff', 'cs', 'penjahit')),
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_user_roles()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_roles_updated_at on public.user_roles;
create trigger trg_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at_user_roles();

alter table public.user_roles enable row level security;

drop policy if exists "user_roles_select_own_or_admin_staff" on public.user_roles;
create policy "user_roles_select_own_or_admin_staff"
on public.user_roles
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.role in ('admin', 'staff')
  )
);

drop policy if exists "user_roles_admin_staff_insert" on public.user_roles;
create policy "user_roles_admin_staff_insert"
on public.user_roles
for insert
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.role in ('admin', 'staff')
  )
);

drop policy if exists "user_roles_admin_staff_update" on public.user_roles;
create policy "user_roles_admin_staff_update"
on public.user_roles
for update
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.role in ('admin', 'staff')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.role in ('admin', 'staff')
  )
);

drop policy if exists "user_roles_admin_staff_delete" on public.user_roles;
create policy "user_roles_admin_staff_delete"
on public.user_roles
for delete
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.is_active = true
      and ur.role in ('admin', 'staff')
  )
);

create or replace function public.handle_new_auth_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role, display_name, is_active)
  values (
    new.id,
    case
      when lower(coalesce(new.raw_user_meta_data->>'role', '')) in ('staff', 'cs', 'penjahit')
        then lower(new.raw_user_meta_data->>'role')
      else 'penjahit'
    end,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    true
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_role on auth.users;
create trigger on_auth_user_created_create_role
after insert on auth.users
for each row
execute function public.handle_new_auth_user_role();

-- =========================================================
-- 3) Internal profile-based auth (tanpa Supabase Auth login)
-- =========================================================
create table if not exists public.user_profiles (
  email text primary key,
  display_name text,
  role text not null default 'penjahit' check (role in ('admin', 'staff', 'cs', 'penjahit')),
  avatar_url text,
  status_text text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_user_profiles()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at_user_profiles();

alter table public.user_profiles enable row level security;

-- =========================================================
-- 4) Master konsumen
-- =========================================================
create table if not exists public.konsumen (
  id uuid primary key default gen_random_uuid(),
  kode_barang text not null unique,
  nama text not null,
  telepon text,
  email text,
  alamat text,
  catatan text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_konsumen()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_konsumen_updated_at on public.konsumen;
create trigger trg_konsumen_updated_at
before update on public.konsumen
for each row
execute function public.set_updated_at_konsumen();

alter table public.konsumen enable row level security;

-- =========================================================
-- 5) OCR logs
-- =========================================================
create table if not exists public.ocr_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'bradflow-clone',
  requested_by_email text,
  raw_result jsonb not null default '{}'::jsonb,
  normalized_result jsonb not null default '{}'::jsonb,
  image_preview text,
  created_at timestamptz not null default now()
);

alter table public.ocr_logs enable row level security;

-- =========================================================
-- 6) Integration source & sync logs
-- =========================================================
create table if not exists public.integration_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_name text not null,
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  idempotency_key text,
  external_id text,
  status text not null default 'success',
  started_at timestamptz,
  completed_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_integration_sync_unique
  on public.integration_sync_logs (source_key, idempotency_key)
  where idempotency_key is not null;

alter table public.integration_sources enable row level security;
alter table public.integration_sync_logs enable row level security;

-- =========================================================
-- 7) Orders extension untuk integrasi lintas app
-- =========================================================
alter table public.orders add column if not exists integration_source text;
alter table public.orders add column if not exists external_id text;

create index if not exists idx_orders_external_id on public.orders (external_id);
create index if not exists idx_orders_integration_source on public.orders (integration_source);

-- seed integration source Bradflow
insert into public.integration_sources (source_key, source_name, is_active, config)
values ('bradflow', 'Bradflow Mobile App', true, jsonb_build_object('schema', 'orders'))
on conflict (source_key) do update
set source_name = excluded.source_name,
    is_active = excluded.is_active,
    config = excluded.config,
    updated_at = now();
