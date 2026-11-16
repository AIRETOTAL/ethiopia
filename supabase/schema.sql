-- =====================================================================
-- ETHIOPIA — esquema de base de datos para Supabase
-- Correr completo en Supabase → SQL Editor → New query → Run.
-- Después correr seed.sql para cargar los productos de ejemplo.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tablas ----------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  position int not null default 0
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  kind text not null check (kind in ('tee', 'hoodie', 'jacket', 'pants', 'shorts')),
  gender text not null default 'unisex' check (gender in ('hombre', 'mujer', 'unisex')),
  price integer not null check (price >= 0),
  description text,
  details text[] not null default '{}',
  fabric text,
  fit text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text not null,
  color_hex text not null,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  unique (product_id, color, size)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  color text,
  view text not null default 'front' check (view in ('front', 'back', 'model', 'detail', 'hang')),
  position int not null default 0
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  address text not null,
  city text not null,
  zip text not null,
  total integer not null default 0,
  status text not null default 'pagado',
  payment_method text not null default 'simulado',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  color text not null,
  size text not null,
  unit_price integer not null,
  qty integer not null check (qty > 0)
);

create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_images_product_idx on public.product_images(product_id);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------- Perfil automático al registrarse ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ¿Es admin? ----------

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- Seguridad (RLS) ----------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Catálogo: lectura pública, escritura solo admin
drop policy if exists "categorias publicas" on public.categories;
create policy "categorias publicas" on public.categories for select using (true);
drop policy if exists "categorias admin" on public.categories;
create policy "categorias admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "productos publicos" on public.products;
create policy "productos publicos" on public.products for select using (active or public.is_admin());
drop policy if exists "productos admin" on public.products;
create policy "productos admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variantes publicas" on public.product_variants;
create policy "variantes publicas" on public.product_variants for select using (true);
drop policy if exists "variantes admin" on public.product_variants;
create policy "variantes admin" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "imagenes publicas" on public.product_images;
create policy "imagenes publicas" on public.product_images for select using (true);
drop policy if exists "imagenes admin" on public.product_images;
create policy "imagenes admin" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- Perfiles: cada uno ve el suyo
drop policy if exists "perfil propio" on public.profiles;
create policy "perfil propio" on public.profiles for select using (id = auth.uid() or public.is_admin());

-- Pedidos: cada uno ve los suyos; el admin ve todos. Se crean solo con place_order().
drop policy if exists "pedidos propios" on public.orders;
create policy "pedidos propios" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "pedidos admin" on public.orders;
create policy "pedidos admin" on public.orders for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items propios" on public.order_items;
create policy "items propios" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

-- ---------- Crear pedido descontando stock (atómico) ----------
-- Recibe: p_items = [{"variant_id": "...", "qty": 2}, ...]
--         p_customer = {"email","full_name","address","city","zip","payment_method"}
-- Bloquea cada variante (FOR UPDATE), así dos compras simultáneas no pueden
-- vender la misma última unidad. El precio sale de la base, nunca del navegador.

create or replace function public.place_order(p_items jsonb, p_customer jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_order uuid;
  v_total integer := 0;
  r record;
  v record;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  if coalesce(p_customer->>'email', '') = '' or coalesce(p_customer->>'full_name', '') = ''
     or coalesce(p_customer->>'address', '') = '' then
    raise exception 'Faltan datos de envío';
  end if;

  insert into public.orders (user_id, email, full_name, address, city, zip, payment_method)
  values (
    auth.uid(),
    p_customer->>'email',
    p_customer->>'full_name',
    p_customer->>'address',
    coalesce(p_customer->>'city', ''),
    coalesce(p_customer->>'zip', ''),
    coalesce(nullif(p_customer->>'payment_method', ''), 'simulado')
  )
  returning id into v_order;

  for r in
    select (e->>'variant_id')::uuid as variant_id, (e->>'qty')::int as qty
    from jsonb_array_elements(p_items) e
  loop
    if r.qty is null or r.qty < 1 or r.qty > 20 then
      raise exception 'Cantidad inválida';
    end if;

    select pv.id, pv.stock, pv.color, pv.size, p.price, p.name
      into v
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
     where pv.id = r.variant_id and p.active
       for update of pv;

    if not found then
      raise exception 'Uno de los productos ya no está disponible';
    end if;

    if v.stock < r.qty then
      raise exception 'Sin stock suficiente: % % talle % (quedan %)', v.name, v.color, v.size, v.stock;
    end if;

    update public.product_variants set stock = stock - r.qty where id = r.variant_id;

    insert into public.order_items (order_id, variant_id, product_name, color, size, unit_price, qty)
    values (v_order, r.variant_id, v.name, v.color, v.size, v.price, r.qty);

    v_total := v_total + v.price * r.qty;
  end loop;

  update public.orders set total = v_total where id = v_order;
  return v_order;
end;
$$;

grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;

-- Resumen de un pedido para la página de confirmación (el id es imposible de adivinar).
create or replace function public.get_order(p_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', o.id,
    'full_name', o.full_name,
    'email', o.email,
    'total', o.total,
    'status', o.status,
    'created_at', o.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', i.product_name, 'color', i.color, 'size', i.size,
        'unit_price', i.unit_price, 'qty', i.qty))
      from public.order_items i where i.order_id = o.id), '[]'::jsonb)
  )
  from public.orders o where o.id = p_id;
$$;

grant execute on function public.get_order(uuid) to anon, authenticated;

-- ---------- Storage para fotos de productos ----------

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "fotos publicas" on storage.objects;
create policy "fotos publicas" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "fotos admin subir" on storage.objects;
create policy "fotos admin subir" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());
drop policy if exists "fotos admin borrar" on storage.objects;
create policy "fotos admin borrar" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());
