# Guía para editar usuarios y categorías

## Dónde se almacenan los emails y contraseñas

Los datos de usuarios (incluyendo email y contraseña encriptada) se guardan en la base de datos SQLite definida por `DATABASE_URL`.

- Esquema del modelo: `prisma/schema.prisma`
- Tabla de usuarios: `User`
- Archivo de autenticación: `pages/api/auth/[...nextauth].ts`
- Registro de nuevos usuarios: `pages/api/auth/register.ts`

Las contraseñas se guardan hasheadas con `bcryptjs`.

## Flujo de nuevos usuarios

- Los nuevos clientes se registran en `pages/register.tsx`.
- Al registrarse, se crea un usuario con `role: 'PENDING'` en `pages/api/auth/register.ts`.
- El administrador acepta o rechaza estas cuentas en `pages/admin/acceptance.tsx`.
- El endpoint que maneja la aprobación está en `pages/api/admin/users.ts`.
- Los usuarios con `role: 'PENDING'` no pueden iniciar sesión.

## Recuperación de contraseña

- Formulario de solicitud: `pages/forgot-password.tsx`
- Endpoint de envío: `pages/api/auth/forgot-password.ts`
- Solicitudes de blanqueo: `data/reset-requests.json`
- Admin de solicitudes: `pages/admin/reset-requests.tsx`
- Endpoint admin: `pages/api/admin/reset-requests.ts`

Las solicitudes quedan registradas y el admin desde el panel puede aceptar o rechazar cada petición.
Al aceptar, el sistema genera una contraseña aleatoria y muestra un aviso para que el admin envíe el email manualmente al cliente.

## Dónde editar o blanquear nuevos usuarios

- Para ver o eliminar usuarios manualmente, revisa la tabla `User` en la base de datos SQLite.
- Para cambiar el comportamiento de blanqueo de contraseñas, edita `pages/api/auth/reset-password.ts`.
- Para invalidar un token de restablecimiento, cambia la clave `PASSWORD_RESET_SECRET`.

## Dónde agregar o quitar categorías

- El modelo de producto se define en `prisma/schema.prisma`.
- El formulario de administración de productos está en `pages/admin/products.tsx`.
- El endpoint de creación/actualización de productos es `pages/api/admin/products.ts`.
- La página principal con filtro por categorías es `pages/home.tsx`.

### Para agregar una nueva categoría

1. Añade la categoría en el campo `Categoría` cuando crees o edites un producto en `pages/admin/products.tsx`.
2. Si quieres forzar una lista de categorías, edita `pages/home.tsx` y reemplaza la generación dinámica de categorías por un array fijo.

### Para quitar una categoría

1. Elimina o cambia los productos que usan esa categoría en la administración de productos.
2. Si quieres eliminar la categoría de la UI, ajusta las opciones en `pages/home.tsx`.

## Notas adicionales

- El landing page ya no muestra los enlaces `Crear cuenta` ni `Continuar como invitado`.
- Estos se encuentran ahora en `pages/login.tsx`.
- El footer está oculto en la landing (`pages/index.tsx`).
