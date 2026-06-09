import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function OrdersListPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/user/orders', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Error cargando órdenes')
        }
        return res.json()
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.error('Orders fetch error:', err)
        setOrders([])
        setError(err.message)
      })
  }, [status])

  if (status === 'loading') return <div className="container mx-auto p-6">Cargando órdenes...</div>
  if (!session) return <div className="container mx-auto p-6">Inicia sesión para ver tus órdenes.</div>

  return (
    <div className="container mx-auto p-6">
      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">{error}</div>}
      <h1 className="text-2xl font-bold mb-4">Mis órdenes</h1>
      <p className="mb-4">Aquí puedes revisar cada orden, su estado y los mensajes del administrador.</p>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Orden #{order.id}</div>
                <div className="text-sm text-slate-500">Total: ${order.total.toFixed(2)}</div>
              </div>
              <Link href={`/orders/${order.id}`} className="rounded bg-slate-800 px-3 py-2 text-white">Ver detalle</Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1">{order.status}</span>
              {order.adminMessage && <span className="rounded-full bg-amber-100 px-3 py-1">Mensaje del admin</span>}
            </div>
          </li>
        ))}
        {orders.length === 0 && <div className="text-slate-600">Aún no tienes órdenes.</div>}
      </ul>
    </div>
  )
}
