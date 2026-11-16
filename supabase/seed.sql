-- ETHIOPIA — productos de ejemplo. Correr después de schema.sql.
-- Precios y stock de ejemplo: editalos desde /admin. Las fotos se sirven desde public/products/.

insert into public.categories (slug, name, position) values
  ('tops', 'Remeras y tops', 0),
  ('sweaters', 'Sweaters', 1),
  ('camperas', 'Camperas', 2),
  ('jeans', 'Jeans', 3),
  ('shorts', 'Shorts', 4)
on conflict (slug) do update set name = excluded.name, position = excluded.position;

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('sweater-cuadros', 'Sweater Cuadros', (select id from public.categories where slug = 'sweaters'), 'hoodie', 'unisex', 85000, 'Sweater tejido con damero grande y logo bordado en el pecho.', array['Tejido en punto grueso', 'Damero de cuadros grandes', 'Logo bordado al tono'], 'Tejido de algodón y acrílico.', 'Oversize, hombro caído.', true)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Verde', '#2F5D46', 'S', 10),
  ('Verde', '#2F5D46', 'M', 0),
  ('Verde', '#2F5D46', 'L', 9),
  ('Verde', '#2F5D46', 'XL', 3),
  ('Beige', '#D8C3A5', 'S', 12),
  ('Beige', '#D8C3A5', 'M', 6),
  ('Beige', '#D8C3A5', 'L', 1),
  ('Beige', '#D8C3A5', 'XL', 5)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/sweater-cuadros-verde-front.webp', 'Verde', 'front', 0),
  ('/products/sweater-cuadros-beige-model.jpg', 'Beige', 'model', 1),
  ('/products/sweater-cuadros-verde-model.jpg', 'Verde', 'model', 2),
  ('/products/sweater-cuadros-verde-hang.webp', 'Verde', 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'sweater-cuadros'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('jean-vintage', 'Jean Vintage', (select id from public.categories where slug = 'jeans'), 'pants', 'unisex', 78000, 'Jean baggy de pierna curva con lavado vintage y desgaste en muslos.', array['Pierna curva (barrel)', 'Lavado vintage con bigotes', 'Etiqueta tejida en el bolsillo trasero'], 'Denim rígido 100% algodón.', 'Baggy, tiro medio.', true)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Azul vintage', '#3E5068', '38', 8),
  ('Azul vintage', '#3E5068', '40', 11),
  ('Azul vintage', '#3E5068', '42', 7),
  ('Azul vintage', '#3E5068', '44', 5)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/jean-vintage-front.webp', null, 'front', 0),
  ('/products/jean-vintage-model.jpg', null, 'model', 1),
  ('/products/jean-vintage-detail.jpg', null, 'detail', 2),
  ('/products/jean-vintage-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'jean-vintage'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('camisa-dsgn', 'Camisa DSGN', (select id from public.categories where slug = 'tops'), 'tee', 'hombre', 52000, 'Camisa boxy de manga corta a rayas finas con estampa gastada al frente.', array['Rayas finas', 'Estampa con efecto gastado', 'Corte boxy y corto'], 'Popelín de algodón.', 'Boxy, manga corta amplia.', false)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Rosa', '#E7C9D6', 'S', 1),
  ('Rosa', '#E7C9D6', 'M', 5),
  ('Rosa', '#E7C9D6', 'L', 10),
  ('Rosa', '#E7C9D6', 'XL', 2)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/camisa-dsgn-front.webp', null, 'front', 0),
  ('/products/camisa-dsgn-model.jpg', null, 'model', 1),
  ('/products/camisa-dsgn-detail.jpg', null, 'detail', 2),
  ('/products/camisa-dsgn-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'camisa-dsgn'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('short-tierra', 'Short Tierra', (select id from public.categories where slug = 'shorts'), 'shorts', 'hombre', 48000, 'Bermuda de jean color tierra con ruedo deshilachado y parches en los bolsillos.', array['Ruedo deshilachado', 'Bolsillos traseros con parche', 'Cinco bolsillos'], 'Denim 100% algodón teñido en prenda.', 'Ancho, largo a la rodilla.', false)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Tierra', '#9C8468', 'S', 10),
  ('Tierra', '#9C8468', 'M', 0),
  ('Tierra', '#9C8468', 'L', 9),
  ('Tierra', '#9C8468', 'XL', 7)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/short-tierra-front.webp', null, 'front', 0),
  ('/products/short-tierra-model.jpg', null, 'model', 1),
  ('/products/short-tierra-detail.jpg', null, 'detail', 2),
  ('/products/short-tierra-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'short-tierra'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('polo-dept', 'Polo Dept', (select id from public.categories where slug = 'tops'), 'tee', 'hombre', 58000, 'Polo tejido a rayas con cierre al cuello y logo grande al frente.', array['Cuello con medio cierre', 'Rayas verticales', 'Logo bordado en relieve'], 'Punto de algodón.', 'Regular, un poco corto.', true)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Bordó', '#4A1A1E', 'S', 11),
  ('Bordó', '#4A1A1E', 'M', 11),
  ('Bordó', '#4A1A1E', 'L', 2),
  ('Bordó', '#4A1A1E', 'XL', 4)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/polo-dept-front.webp', null, 'front', 0),
  ('/products/polo-dept-model.jpg', null, 'model', 1),
  ('/products/polo-dept-model-2.jpg', null, 'model', 2),
  ('/products/polo-dept-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'polo-dept'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('buzo-rayado', 'Buzo Rayado', (select id from public.categories where slug = 'sweaters'), 'hoodie', 'hombre', 82000, 'Buzo tejido mitad y mitad con rayas en dos tonos y logo grande.', array['Diseño en dos mitades', 'Rayas finas', 'Puños y ruedo en contraste'], 'Tejido de algodón.', 'Oversize.', false)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Rosa rayado', '#E8B9BE', 'S', 9),
  ('Rosa rayado', '#E8B9BE', 'M', 11),
  ('Rosa rayado', '#E8B9BE', 'L', 2),
  ('Rosa rayado', '#E8B9BE', 'XL', 10)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/buzo-rayado-model.jpg', null, 'model', 0)
) as v(url, color, view, pos)
where p.slug = 'buzo-rayado'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('musculosa-rib', 'Musculosa Rib', (select id from public.categories where slug = 'tops'), 'tee', 'mujer', 28000, 'Musculosa corta de morley acanalado con logo en relieve.', array['Morley acanalado', 'Logo en relieve al tono', 'Corte corto'], 'Morley de algodón con elastano.', 'Al cuerpo, corta.', true)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Blanco', '#F2F1EE', 'S', 6),
  ('Blanco', '#F2F1EE', 'M', 0),
  ('Blanco', '#F2F1EE', 'L', 9),
  ('Blanco', '#F2F1EE', 'XL', 1),
  ('Negro', '#161616', 'S', 6),
  ('Negro', '#161616', 'M', 0),
  ('Negro', '#161616', 'L', 9),
  ('Negro', '#161616', 'XL', 5)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/musculosa-rib-blanco-front.webp', 'Blanco', 'front', 0),
  ('/products/musculosa-rib-blanco-model.jpg', 'Blanco', 'model', 1),
  ('/products/musculosa-rib-negro-model.jpg', 'Negro', 'model', 2),
  ('/products/musculosa-rib-blanco-model-2.jpg', 'Blanco', 'model', 3),
  ('/products/musculosa-rib-blanco-hang.webp', 'Blanco', 'hang', 4)
) as v(url, color, view, pos)
where p.slug = 'musculosa-rib'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('sweater-rosa', 'Sweater Rosa', (select id from public.categories where slug = 'sweaters'), 'hoodie', 'mujer', 80000, 'Sweater de punto inglés con pin metálico dorado en el pecho.', array['Punto inglés grueso', 'Pin metálico dorado', 'Cuello redondo alto'], 'Tejido de algodón.', 'Oversize, largo regular.', true)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Rosa', '#EFC4C4', 'S', 0),
  ('Rosa', '#EFC4C4', 'M', 7),
  ('Rosa', '#EFC4C4', 'L', 12),
  ('Rosa', '#EFC4C4', 'XL', 8)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/sweater-rosa-front.webp', null, 'front', 0),
  ('/products/sweater-rosa-model.jpg', null, 'model', 1),
  ('/products/sweater-rosa-model-2.jpg', null, 'model', 2),
  ('/products/sweater-rosa-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'sweater-rosa'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('campera-work', 'Campera Work', (select id from public.categories where slug = 'camperas'), 'jacket', 'unisex', 125000, 'Campera de trabajo en denim negro lavado con cierre de dos vías y broches en el cuello.', array['Cierre de dos vías', 'Broches en el cuello', 'Bolsillos de parche', 'Logo bordado al tono'], 'Denim pesado 100% algodón.', 'Oversize, hombros marcados.', true)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Negro lavado', '#2B2D33', 'S', 2),
  ('Negro lavado', '#2B2D33', 'M', 6),
  ('Negro lavado', '#2B2D33', 'L', 1),
  ('Negro lavado', '#2B2D33', 'XL', 1)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/campera-work-front.webp', null, 'front', 0),
  ('/products/campera-work-model.jpg', null, 'model', 1),
  ('/products/campera-work-model-2.jpg', null, 'model', 2),
  ('/products/campera-work-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'campera-work'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('musculosa-cold', 'Musculosa Cold', (select id from public.categories where slug = 'tops'), 'tee', 'mujer', 36000, 'Musculosa oversize con lavado ácido, costuras expuestas y frase estampada.', array['Lavado ácido', 'Costuras expuestas', 'Estampa tipográfica'], 'Jersey pesado de algodón.', 'Oversize, sin mangas.', false)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Gris lavado', '#55565A', 'S', 0),
  ('Gris lavado', '#55565A', 'M', 8),
  ('Gris lavado', '#55565A', 'L', 3),
  ('Gris lavado', '#55565A', 'XL', 9)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/musculosa-cold-front.webp', null, 'front', 0),
  ('/products/musculosa-cold-model.jpg', null, 'model', 1),
  ('/products/musculosa-cold-model-2.jpg', null, 'model', 2),
  ('/products/musculosa-cold-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'musculosa-cold'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

with prod as (
  insert into public.products (slug, name, category_id, kind, gender, price, description, details, fabric, fit, featured)
  values ('bermuda-cargo', 'Bermuda Cargo', (select id from public.categories where slug = 'shorts'), 'shorts', 'mujer', 54000, 'Bermuda cargo de cuadrillé con cintura elástica y cordones en el ruedo.', array['Cintura elástica', 'Bolsillos cargo', 'Cordones ajustables en el ruedo'], 'Algodón con trama cuadrillé.', 'Ancha, largo bajo la rodilla.', false)
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into public.product_variants (product_id, color, color_hex, size, stock)
select prod.id, v.color, v.hex, v.size, v.stock from prod, (values
  ('Cuadrillé', '#3A3F4A', 'S', 11),
  ('Cuadrillé', '#3A3F4A', 'M', 5),
  ('Cuadrillé', '#3A3F4A', 'L', 10),
  ('Cuadrillé', '#3A3F4A', 'XL', 0)
) as v(color, hex, size, stock)
on conflict (product_id, color, size) do nothing;

insert into public.product_images (product_id, url, color, view, position)
select p.id, v.url, v.color, v.view, v.pos from public.products p, (values
  ('/products/bermuda-cargo-front.webp', null, 'front', 0),
  ('/products/bermuda-cargo-model.jpg', null, 'model', 1),
  ('/products/bermuda-cargo-model-2.jpg', null, 'model', 2),
  ('/products/bermuda-cargo-hang.webp', null, 'hang', 3)
) as v(url, color, view, pos)
where p.slug = 'bermuda-cargo'
  and not exists (select 1 from public.product_images x where x.product_id = p.id and x.url = v.url);

