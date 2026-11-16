-- =====================================================================
-- ETHIOPIA — refuerzo de seguridad (correr una vez en el SQL Editor)
-- =====================================================================

-- Largos máximos en los datos que manda el cliente
alter table public.orders drop constraint if exists orders_lengths;
alter table public.orders add constraint orders_lengths check (
  char_length(email) <= 254 and char_length(full_name) <= 120 and
  char_length(address) <= 200 and char_length(city) <= 80 and char_length(zip) <= 12
);

-- Nadie puede darse permisos de admin a sí mismo: profiles no tiene política de update,
-- y además se bloquea a nivel de columna por las dudas.
revoke update on public.profiles from anon, authenticated;

-- Pedidos: máximo 30 líneas por pedido (evita pedidos gigantes)
create or replace function public.check_order_size()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.order_items where order_id = new.order_id) >= 30 then
    raise exception 'Demasiados productos en un solo pedido';
  end if;
  return new;
end;
$$;
drop trigger if exists order_items_limit on public.order_items;
create trigger order_items_limit before insert on public.order_items
  for each row execute function public.check_order_size();

-- Fotos del bucket: solo imágenes y hasta 5 MB
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'products';
