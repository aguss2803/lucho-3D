import { GetServerSideProps } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../lib/prisma'
import Link from 'next/link'
import { useEffect } from 'react'
import { useCart } from '../../context/CartContext'

export default function OrderPage({ order }: { order: any }) {
  const { clear } = useCart()

  useEffect(() => {
    // If the order is paid, clear the local cart so the user doesn't keep items
    if (order?.paid) {
      clear()
    }
  }, [order?.paid, clear])

  if (!order) return <div className="container mx-auto p-6">Orden no encontrada o no autorizada</div>
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Orden #{order.id}</h1>
      <div className="mb-2">Alias: {order.buyerAlias || '—'}</div>
      <div className="mb-2">Total: ${order.total.toFixed(2)}</div>
      <div className="mb-2">Estado: {order.status === 'APPROVED' ? <span className="text-green-600">Aprobada</span> : order.status === 'AWAITING_APPROVAL' ? <span className="text-yellow-600">Pendiente de pago</span> : <span className="text-gray-600">{order.status}</span>}</div>
      {order.deliveryEstimate && (
        <div className="mb-2">Plazo de entrega: {order.deliveryEstimate}</div>
      )}
      {order.shippingRequested && (
        <div className="mb-2">Envío por correo: ${order.shippingCost?.toFixed(2) || '1200'}</div>
      )}
      {order.paymentProof && (
        <div className="mt-4">
          <div className="font-semibold mb-2">Comprobante de transferencia</div>
          <img src={order.paymentProof} alt="Comprobante de transferencia" className="max-w-sm rounded" />
        </div>
      )}
      {order.adminMessage && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="font-semibold">Mensaje del administrador</div>
          <div className="mt-2 text-slate-700">{order.adminMessage}</div>
        </div>
      )}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Items</h2>
        <ul>
          {order.items.map((it: any) => (
            <li key={it.id} className="py-2 border-b">
              Producto: {it.productId} — Cantidad: {it.qty} — Precio: ${it.price}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <Link href="/">Volver a la tienda</Link>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = await getToken({ req: ctx.req as any, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return { props: { order: null } }
  const userId = Number((token as any).sub || token.id)
  const id = Number(ctx.params?.id)
  if (isNaN(id)) return { props: { order: null } }

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) return { props: { order: null } }

  // Allow if user is owner or role is OWNER
  const role = (token as any).role
  if (order.userId !== userId && role !== 'OWNER') return { props: { order: null } }

  return { props: { order: JSON.parse(JSON.stringify(order)) } }
}
