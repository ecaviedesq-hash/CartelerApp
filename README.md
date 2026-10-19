# Mi Cartelera Personal

Aplicación para registrar, organizar y calificar las películas y series que quieres ver, estás viendo o ya viste. La búsqueda usa el API de TMDB. Cada cuenta guarda su propia lista en Supabase, y las políticas RLS impiden ver o editar los títulos de otra persona.

## Qué hace

- Registro, inicio de sesión y cierre de sesión. Sin sesión no se abre ninguna pantalla de la cartelera.
- Búsqueda en TMDB con póster, título, año, nota oficial, carga y error.
- Agregar un resultado a la tabla `mi_lista`.
- Ver, editar (estado, calificación de 1 a 5 y comentario) y eliminar títulos propios.
- Ficha con póster grande, sinopsis, elenco y tu nota personal.
- Filtro por estado, orden por calificación o fecha, y el resumen de pendientes, en progreso y vistas.

## 1. Crear las claves

Necesitas dos cuentas gratuitas: [Supabase](https://supabase.com) y [TMDB](https://www.themoviedb.org/signup).

En Supabase, crea un proyecto y copia **Project URL** y la clave **anon public** (Settings → API). No uses la clave `service_role` en esta app.

En TMDB, entra a Settings → API y crea una API key.

En la raíz del proyecto, copia el ejemplo y rellena los valores:

```bash
copy .env.example .env
```

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon
VITE_TMDB_API_KEY=tu_api_key_de_tmdb
```

Las variables tienen que empezar por `VITE_` para que Vite las lea. Reinicia `npm run dev` después de cambiar el archivo. `.env` está en `.gitignore`.

## 2. Crear la tabla y las políticas

`supabase/schema.sql` no es un programa. No se abre con doble clic ni se corre en la terminal.

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) y abre el proyecto. Si dice que está pausado, restáuralo y espera a que termine.
2. En el menú izquierdo abre **SQL Editor**.
3. Pulsa **New query**.
4. Borra el ejemplo, pega **todo** el contenido de `supabase/schema.sql` y pulsa **Run**.
5. Abajo debe decir **Success**. En **Table Editor** aparece la tabla `mi_lista`.

Si un intento anterior se quedó a medias, vuelve a pegar el archivo y pulsa Run otra vez: el script se puede repetir.

Ese script crea `mi_lista`, la relaciona con `auth.users` y activa cuatro políticas RLS: cada usuario solo puede leer, insertar, editar y borrar filas cuyo `user_id` es el suyo. Un trigger reemplaza el `user_id` enviado por el navegador con `auth.uid()`, así que no se puede guardar un título a nombre de otra cuenta.

En **Authentication → Sign In / Providers → Email**, desactiva **Confirm email** si quieres entrar apenas te registres. Si lo dejas activo, la app pide que abras el correo antes de iniciar sesión.

En **Authentication → URL Configuration**, agrega `http://localhost:5173`.

El editor de tablas de Supabase muestra todas las filas porque entra como administrador y no pasa por RLS. La app sí pasa por RLS.

## 3. Arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## 4. Comprobar que RLS funciona

1. Crea la cuenta A, busca un título y agrégalo.
2. Cierra sesión y crea la cuenta B. Su lista debe estar vacía.
3. Con B, abre la URL de la ficha de A (`/lista/1` u otro id). Debe decir que ese título no está en tu lista.
4. Vuelve a A y confirma que el título sigue ahí, con su estado, nota y comentario.

## 5. Publicar

El proyecto incluye `vercel.json` para que las rutas de React funcionen al recargar.

1. Sube el repositorio a GitHub.
2. Impórtalo en [Vercel](https://vercel.com).
3. Define las mismas tres variables `VITE_...`.
4. Cuando tengas la URL de producción, agrégala en Supabase → Authentication → URL Configuration.

## Estructura

```text
src/pages          Login, registro, búsqueda, mi lista y ficha
src/components     Layout, rutas protegidas, póster, estrellas, estado
src/context        Sesión de Supabase Auth
src/lib            TMDB, consultas a mi_lista, filtros y textos
supabase/schema.sql
```

## Seguridad

La clave anónima de Supabase está hecha para vivir en el navegador. Lo que protege los datos son las políticas RLS, no esconder esa clave. La API key de TMDB también viaja al navegador porque la búsqueda se hace desde el frontend; por eso va en variables de entorno y no escrita en el código. No pongas la clave `service_role` en el proyecto.
