import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'

type Product = {
  id: number
  title: string
  price: number
  category?: string
  image?: string
  isOnOffer?: boolean
  previousPrice?: number
  description?: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [offers, setOffers] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const { add } = useCart()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  useEffect(() => {
    const qs = []
    if (selectedCategory) qs.push('category=' + encodeURIComponent(selectedCategory))
    if (min) qs.push('min=' + encodeURIComponent(min))
    if (max) qs.push('max=' + encodeURIComponent(max))
    const query = qs.length ? ('?' + qs.join('&')) : ''
    fetch('/api/products' + query)
      .then((r) => r.json())
      .then((data) => setProducts(data))
  }, [selectedCategory, min, max])

  useEffect(() => {
    fetch('/api/products?offer=true')
      .then((r) => r.json())
      .then((data) => setOffers(data.slice(0, 5)))
  }, [])

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: Product[]) => {
        const cats = new Set<string>()
        data.forEach((product) => cats.add(product.category || 'Sin categoría'))
        setCategories(Array.from(cats))
      })
  }, [])

  const clearFilters = () => {
    setSelectedCategory('')
    setMin('')
    setMax('')
  }

  return (
    <div className="container mx-auto p-6">
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Ofertas destacadas</h2>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {offers.map((offer) => (
              <div key={offer.id} className="w-72 rounded-3xl overflow-hidden border bg-white shadow-sm">
                <Image src={offer.image || '/images/placeholder.png'} alt={offer.title} width={288} height={176} className="h-44 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-red-600 font-semibold mb-2">🔥 Oferta</div>
                  <h3 className="font-semibold text-lg mb-2">{offer.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-slate-900">${offer.price.toFixed(2)}</div>
                    <div className="text-sm line-through text-slate-400">${(offer.previousPrice || offer.price * 1.2).toFixed(2)}</div>
                  </div>
                  <Link href={`/products/${offer.id}`} className="mt-3 inline-block text-sky-600">Ver producto</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Categorías</h3>
            <button onClick={() => setSelectedCategory('')} className={`block w-full text-left px-3 py-2 rounded ${selectedCategory === '' ? 'bg-slate-200' : 'hover:bg-slate-100'}`}>Todas</button>
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)} className={`block w-full text-left px-3 py-2 rounded ${selectedCategory === category ? 'bg-slate-200' : 'hover:bg-slate-100'}`}>
                {category}
              </button>
            ))}
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Filtrar precio</h3>
            <input placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} className="mb-2 w-full border px-3 py-2" />
            <input placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} className="mb-2 w-full border px-3 py-2" />
            <button onClick={clearFilters} className="w-full bg-slate-900 text-white px-3 py-2 rounded">Limpiar filtros</button>
          </div>
        </aside>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Productos</h2>
            {selectedCategory && <div className="text-sm text-slate-500">Filtrando: {selectedCategory}</div>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="card p-4 shadow-sm border rounded-3xl bg-white">
                <Image src={p.image || '/images/placeholder.png'} alt={p.title} width={360} height={240} className="h-40 w-full object-cover mb-2 rounded-2xl" />
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{p.title}</h3>
                  {p.isOnOffer && <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">Oferta</span>}
                </div>
                <p className="text-sm text-slate-500 mb-3">{p.category || 'Sin categoría'}</p>
                <p className="muted text-sm mb-4">{p.description?.slice(0, 100)}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-lg font-bold">${p.price.toFixed(2)}</div>
                    {p.isOnOffer && <div className="text-sm line-through text-slate-400">${(p.previousPrice || p.price * 1.2).toFixed(2)}</div>}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Link href={`/products/${p.id}`} className="text-sky-600">Ver</Link>
                    <button className="btn-primary" onClick={() => add({ id: p.id, title: p.title, price: p.price, qty: 1 })}>Agregar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
