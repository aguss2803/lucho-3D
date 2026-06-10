# Lucho 3D Shop (scaffold)

Proyecto scaffold para una tienda de productos 3D con Next.js + TypeScript, Tailwind CSS, Prisma (SQLite) y PDF invoice generation.

Requerimientos implementados o previstos:
- Carga de productos (admin)
- Sección 'Nuestra historia'
- Base de datos SQLite con Prisma y seed
- CRUD de stock y precios (admin)
- Pestaña "Ofertas" editable por el dueño (admin)
- Login de usuarios (credenciales simples)
- Compra obligatoria con login
- Carrito de compras (guardado en session/localStorage)
- Generación de PDF en servidor como factura
- UI pensada para productos 3D (placeholder visual)

Quick start (Windows PowerShell):

1. Instala dependencias

```powershell
npm install
```

2. Generar cliente Prisma y migrar DB

```powershell
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

3. Correr en desarrollo

```powershell
npm run dev
```

Creado como scaffold para continuar desarrollo. El admin de ejemplo y productos de prueba se crean con `npm run seed`.

Siguientes pasos recomendados:
- Añadir NextAuth para autenticación completa y roles
- Pulir UI y agregar imágenes reales de productos 3D
- Añadir tests para endpoints críticos
 
Pago con Mercado Pago
--------------------

Si quieres aceptar pagos con Mercado Pago, define la variable de entorno:

- `MERCADOPAGO_ACCESS_TOKEN` — tu access token de Mercado Pago

El endpoint que crea la preferencia está en `pages/api/payments/mercadopago.ts`.
El flujo de pago en el carrito (`pages/cart.tsx`) llamará a este endpoint y abrirá el link de pago o mostrará un QR si la API lo devuelve.

