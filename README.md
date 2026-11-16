# Ethiopia — tienda de ropa

E-commerce de indumentaria con **Next.js 15**, **Tailwind CSS 4**, **Motion** (animaciones), **Supabase** (base de datos, login, fotos) y deploy en **Vercel**.

- **Home:** perchero animado (las prendas se balancean, se deslizan con el mouse o el dedo y se abren en un panel de compra). Sección de marca que se mueve con el scroll, categorías y "Probá el look".
- **Tienda:** filtros por categoría, talle y color, solo con stock y orden por precio, con animaciones al filtrar.
- **Producto:** galería frente y espalda, selector de color y talle con **stock real por combinación** y detalles desplegables.
- **Carrito:** panel lateral que se guarda aunque recargues la página.
- **Checkout:** pago simulado con tarjeta animada. El stock se descuenta en la base de forma atómica, así no se puede vender una unidad que no existe.
- **Cuentas:** registro, login e historial de pedidos.
- **Admin (`/admin`):** editar stock y precios, ocultar o destacar productos, crear productos con fotos y ver los últimos pedidos.

---

## 1. Correrlo en tu compu

Necesitás **Node.js 20 o superior**.

```bash
npm install
npm run dev
```

Abrí http://localhost:3000.

Sin configurar nada, la tienda arranca en **modo demo**, con 11 productos y sus fotos reales (sin fondo para el perchero y con modelo para el catálogo). Podés recorrer todo y comprar con el pago simulado. Lo único que no funciona en modo demo es el login y el admin.

## 2. Conectar Supabase

1. Creá un proyecto en https://supabase.com.
2. Andá a **SQL Editor → New query**, pegá el contenido de `supabase/schema.sql` y tocá **Run**.
3. Hacé lo mismo con `supabase/seed.sql`, que carga los productos de ejemplo.
4. Copiá `.env.example` como `.env.local` y completá los datos, que están en **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Reiniciá `npm run dev`. El cartel de "modo demo" desaparece.

**Para la clase:** si querés registrarte sin confirmar el email, entrá a **Authentication → Sign In / Providers → Email** y desactivá *Confirm email*.

### Hacerte admin

Registrate en `/login` y después corré esto en el SQL Editor, con tu email:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'tu@email.com');
```

Desde tu cuenta (`/cuenta`) vas a ver el botón **Panel admin**.

## 3. Deploy en Vercel

1. Subí el proyecto a un repo de GitHub.
2. En https://vercel.com, tocá **Add New → Project** e importá el repo.
3. En **Environment Variables** cargá las mismas dos variables del `.env.local`.
4. Tocá **Deploy**. Cada vez que hagas push a `main`, se vuelve a publicar solo.

## 4. Fotos de productos

- **Con Supabase:** subilas desde `/admin` al crear un producto (frente y espalda). Se guardan en Supabase Storage.
- **En modo demo:** poné las fotos en `public/products/`. En `public/products/LEEME.txt` están los nombres que tienen que tener, por ejemplo `buzo-lanza-front.png`.
- Si una prenda no tiene foto, se muestra la ilustración en su color.
- Las fotos de la prenda sola con **fondo transparente (PNG)** son las que mejor quedan colgadas en el perchero.

## 5. Pago simulado

No se cobra nada. Cualquier número de tarjeta de 16 dígitos se aprueba, y una que termine en **0002** se rechaza, para mostrar el caso de error.

Para cobrar de verdad, el paso siguiente sería integrar Mercado Pago Checkout Pro en `src/app/api/checkout/route.ts`.

## 6. Cómo funciona el stock (para explicar en clase)

Cada producto tiene **variantes**: una por cada combinación de color y talle, cada una con su stock. Al comprar, el navegador solo manda qué variantes y cuántas unidades. La función `place_order` de la base de datos (`supabase/schema.sql`):

1. Bloquea cada variante (`FOR UPDATE`), así dos compras al mismo tiempo no pueden llevarse la última unidad.
2. Verifica el stock y lo descuenta.
3. Toma el **precio de la base de datos**, nunca el que manda el navegador, para que nadie pueda cambiarlo.
4. Crea el pedido y sus ítems, todo en una sola transacción.

Las reglas de seguridad (RLS) hacen que cualquiera pueda ver el catálogo, que cada usuario vea solo sus pedidos y que solo el admin pueda editar productos y stock.

## Estructura

```
src/
  app/
    page.tsx              Home (perchero, marca, categorías, looks)
    tienda/               Catálogo con filtros
    producto/[slug]/      Página de producto
    checkout/             Checkout y pago simulado
    pedido/[id]/          Confirmación del pedido
    login/  cuenta/       Cuentas e historial
    admin/                Panel de admin y server actions
    api/checkout/         Endpoint que crea el pedido
  components/             Rail (perchero), ProductDetail, Looks, CartDrawer, Emblem…
  lib/
    data.ts               Lee productos de Supabase (o datos demo)
    cart-store.ts         Carrito (Zustand, guardado en el navegador)
    mock-data.ts          Productos de ejemplo
supabase/
  schema.sql              Tablas, seguridad, place_order, storage
  seed.sql                Productos de ejemplo
```
