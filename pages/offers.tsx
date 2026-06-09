import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Offers() {
  const [products, setProducts] = useState<any[]>([])
  useEffect(() => { fetch('/api/products?offer=true').then(r=>r.json()).then(setProducts) }, [])
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ofertas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p=> (
          <div key={p.id} className="card p-4">
            <Image src={p.image || '/images/placeholder.png'} alt={p.title} width={320} height={200} className="h-40 w-full object-cover mb-2" />
            <div className="font-semibold">{p.title}</div>
            <div className="muted">{(p as any).description?.slice?.(0,80)}</div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-lg font-bold">${p.price.toFixed(2)}</div>
              <Link href={`/products/${p.id}`} className="text-sky-600">Ver</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
