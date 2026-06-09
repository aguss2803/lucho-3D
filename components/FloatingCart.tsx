import Link from 'next/link'
import { useCart } from '../context/CartContext'

export default function FloatingCart() {
  const { items, total } = useCart()
  const qty = items.reduce((sum, item) => sum + item.qty, 0)
  if (!qty) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-3xl bg-slate-900 px-4 py-3 text-white shadow-2xl ring-1 ring-black/10">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-xl">🛒</div>
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-orange-200">Carrito flotante</div>
          <div className="font-semibold">{qty} artículo{qty === 1 ? '' : 's'} - ${total().toFixed(2)}</div>
        </div>
      </div>
      <Link href="/cart" className="mt-3 inline-block w-full rounded-full bg-white px-3 py-2 text-center text-slate-900 font-semibold">Ir al carrito</Link>
    </div>
  )
}
