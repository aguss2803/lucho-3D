import Link from 'next/link'

export default function Admin() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Panel del dueño</h1>
      <p>Aquí el dueño puede crear productos, editar stock y precios, y marcar ofertas.</p>
      <p>Este panel requiere autenticación (inicia sesión como owner)</p>
      <p><Link href="/admin/products" className="text-blue-600">Ir a gestión de productos</Link></p>
      <p><Link href="/admin/pagos" className="text-blue-600">Pagos</Link></p>
      <p><Link href="/admin/acceptance" className="text-blue-600">Aceptación de nuevos clientes</Link></p>
      <p><Link href="/admin/reset-requests" className="text-blue-600">Solicitudes de blanqueo de contraseña</Link></p>
    </div>
  )
}
