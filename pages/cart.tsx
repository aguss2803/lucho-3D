import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function CartPage() {
  const { items, remove, total } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null)
  const [proofFileName, setProofFileName] = useState<string>('')
  const [shippingRequested, setShippingRequested] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)
  const shippingCost = 1200
  const finalTotal = total() + (shippingRequested ? shippingCost : 0)

  async function checkout() {
    if (!session) {
      router.push('/login')
      return
    }
    setIsProcessing(true)
    try {
      if (!proofDataUrl) {
        alert('Por favor carga el comprobante de transferencia antes de continuar.')
        setIsProcessing(false)
        return
      }

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: proofFileName || `proof-${Date.now()}.png`, data: proofDataUrl.split(',')[1] }),
      })
      if (!uploadRes.ok) {
        const err = await uploadRes.text().catch(() => 'Error subiendo comprobante')
        alert(err)
        setIsProcessing(false)
        return
      }
      const uploadJson = await uploadRes.json()
      const proofUrl = uploadJson.url

      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ id: i.id, qty: i.qty, price: i.price })),
          total: finalTotal,
          paymentProof: proofUrl,
          shippingRequested,
          shippingCost: shippingRequested ? shippingCost : 0,
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert('Error en el pago: ' + (j.error || res.statusText))
        setIsProcessing(false)
        return
      }

      const j = await res.json()
      setOrderId(j.orderId || null)
      alert('Pedido enviado. El administrador lo revisará pronto.')
      setIsProcessing(false)
      return
    } catch (err) {
      console.error('checkout error', err)
      alert('Error de red en checkout')
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Carrito</h1>
      {items.length === 0 ? (
        <p>El carrito está vacío</p>
      ) : (
        <div>
          <ul>
            {items.map(i => (
              <li key={i.id} className="flex justify-between border-b py-2">
                <div>
                  <div className="font-semibold">{i.title}</div>
                  <div>Cantidad: {i.qty}</div>
                </div>
                <div>
                  <div>${(i.price * i.qty).toFixed(2)}</div>
                  <button className="text-red-600" onClick={() => remove(i.id)}>Quitar</button>
                </div>
              </li>
            ))}
          </ul>
              <div className="mt-4">
                <div className="font-bold">Total base: ${total().toFixed(2)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <input id="shipping" type="checkbox" checked={shippingRequested} onChange={(e) => setShippingRequested(e.target.checked)} />
                  <label htmlFor="shipping" className="text-sm">Agregar envío por correo (+${shippingCost})</label>
                </div>
                {shippingRequested && <div className="mt-2 text-sm text-slate-600">Costo de envío agregado: ${shippingCost}</div>}
                <div className="mt-4 text-lg font-semibold">Total a pagar: ${finalTotal.toFixed(2)}</div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-700">Alias de la empresa</div>
                  <div className="mt-2 rounded-lg border border-slate-300 bg-white p-3 text-slate-800 font-medium">aguss2803.nx.ars</div>
                  <div className="mt-2 text-sm text-slate-500">Usa este alias para tu transferencia.</div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Comprobante de transferencia</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (file.size > 1024 * 1024 * 4) {
                      alert('El comprobante debe ser menor a 4MB')
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => {
                      setProofDataUrl(reader.result as string)
                      setProofFileName(file.name)
                    }
                    reader.readAsDataURL(file)
                  }} className="border rounded px-2 py-2 mt-1 w-full" />
                  {proofDataUrl && <img src={proofDataUrl} alt="Comprobante de transferencia" className="mt-3 w-full max-w-xs rounded" />}
                </div>
                <button disabled={isProcessing} className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded mt-4" onClick={checkout}>{isProcessing ? 'Procesando...' : 'Pagar'}</button>
              </div>
        </div>
      )}

      {/* Order confirmation */}
      {orderId && (
        <div className="fixed bottom-4 right-4 bg-white border p-3 rounded shadow">
          <div className="text-sm">Pedido enviado. El número de orden es {orderId}. El administrador revisará tu comprobante.</div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => window.location.href = `/orders/${orderId}`}>Ver orden</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setOrderId(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}
