import { useEffect, useState } from 'react'
import Link from 'next/link'

type OrderItem = { id: number; productId: number; qty: number; price: number }
type Order = {
  id: number
  total: number
  status: string
  paymentProof?: string
  shippingRequested?: boolean
  shippingCost?: number
  buyerAlias?: string
  deliveryEstimate?: string
  adminMessage?: string
  items: OrderItem[]
  createdAt: string
}

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [deliveryEstimates, setDeliveryEstimates] = useState<Record<number, string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/payments', { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'No autorizado')
        }
        setOrders(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error('Admin payments load error:', err)
        setOrders([])
        setError(err.message || 'Error cargando pagos')
      }
    }
    load()
  }, [])

  const refresh = async () => {
    const res = await fetch('/api/admin/payments', { credentials: 'include' })
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
  }

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const adminMessage = notes[id] || ''
    const deliveryEstimate = deliveryEstimates[id] || ''
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, message: adminMessage, deliveryEstimate }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(data.error || 'No se pudo actualizar la orden. Intenta de nuevo.')
      return
    }

    setMessage(`Orden ${id} ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente.`)
    await refresh()
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pagos pendientes</h1>
      <p className="mb-4">Revisa los comprobantes, artículos y cantidades. Puedes aprobar o rechazar el pago y dejar un mensaje al cliente.</p>
      {message && <div className="mb-4 rounded-lg bg-green-100 p-3 text-slate-800">{message}</div>}
      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">{error}</div>}
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Orden #{order.id}</div>
                <div className="text-sm text-slate-500">Creada {new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">{order.status}</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <div className="font-semibold">Total</div>
                <div>${order.total.toFixed(2)}</div>
                {order.shippingRequested && (
                  <div className="mt-2 text-sm text-slate-600">Envío: ${order.shippingCost?.toFixed(2) ?? '1200'}</div>
                )}
                {order.buyerAlias && <div className="mt-2 text-sm text-slate-600">Alias: {order.buyerAlias}</div>}
                {order.deliveryEstimate && <div className="mt-2 text-sm text-slate-600">Plazo: {order.deliveryEstimate}</div>}
              </div>
              <div>
                <div className="font-semibold">Comprobante</div>
                {order.paymentProof ? (
                  <img src={order.paymentProof} alt={`Comprobante orden ${order.id}`} className="mt-2 max-h-48 w-full rounded object-contain" />
                ) : (
                  <div className="mt-2 text-sm text-slate-500">No hay comprobante</div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="font-semibold">Artículos</div>
              <ul className="mt-2 space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    Producto ID: {item.productId} — Cantidad: {item.qty} — Precio: ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Plazo de entrega</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded border border-slate-300 p-2"
                  value={deliveryEstimates[order.id] || ''}
                  onChange={(e) => setDeliveryEstimates((prev) => ({ ...prev, [order.id]: e.target.value }))}
                  placeholder="Ej. 5-7 días"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Mensaje al cliente</label>
                <textarea
                  rows={3}
                  className="mt-2 w-full rounded border border-slate-300 p-2"
                  value={notes[order.id] || ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [order.id]: e.target.value }))}
                  placeholder="Escribe aquí instrucciones o feedback para el cliente..."
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleAction(order.id, 'approve')} className="rounded bg-green-600 px-4 py-2 text-white">Aprobar pago</button>
              <button onClick={() => handleAction(order.id, 'reject')} className="rounded bg-red-600 px-4 py-2 text-white">Rechazar pago</button>
              <Link href={`/orders/${order.id}`} className="rounded border border-slate-300 px-4 py-2 text-slate-800">Ver orden</Link>
            </div>
          </li>
        ))}
        {orders.length === 0 && <div className="text-slate-600">No hay pagos pendientes.</div>}
      </ul>
    </div>
  )
}
