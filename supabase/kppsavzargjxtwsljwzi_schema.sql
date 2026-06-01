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
