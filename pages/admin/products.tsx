import { useEffect, useState } from 'react'

type Product = { id: number; title: string; price: number; stock: number; category?: string; previousPrice?: number; isOnOffer: boolean; image?: string; description?: string }
type EditingOffer = { productId: number; offerPrice: string }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({ title: '', price: '', previousPrice: '', category: '', stock: '', image: '', description: '', isOnOffer: false })
  const [uploadError, setUploadError] = useState('')
  const [editingOffers, setEditingOffers] = useState<Map<number, EditingOffer>>(new Map())

  useEffect(() => { fetch('/api/products').then(r => r.json()).then(setProducts) }, [])

  async function create(e: any) {
    e.preventDefault()
    if (!form.title || !form.price || !form.stock) {
      alert('Por favor completa Titulo, Precio y Stock')
      return
    }
    try {
      let imageUrl = form.image
      if (form.image && form.image.startsWith('data:')) {
        const body = { filename: `upload-${Date.now()}.png`, data: form.image.split(',')[1] }
        const up = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!up.ok) {
          alert('Error subiendo imagen')
          return
        }
        const j = await up.json()
        imageUrl = j.url
      }
      const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, image: imageUrl, price: Number(form.price), previousPrice: form.previousPrice ? Number(form.previousPrice) : undefined, stock: Number(form.stock) }) })
      if (res.ok) {
        const p = await res.json()
        setProducts((prev) => [p, ...prev])
        setForm({ title: '', price: '', previousPrice: '', category: '', stock: '', image: '', description: '', isOnOffer: false })
        alert('Producto creado exitosamente')
      } else {
        const err = await res.text()
        alert('Error: ' + err)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function remove(id: number) {
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setProducts((prev) => prev.filter(p => p.id !== id))
  }

  async function updateOffer(productId: number, offerPrice: string) {
    const price = Number(offerPrice)
    if (!offerPrice || isNaN(price) || price <= 0) {
      alert('Ingresa un precio válido')
      return
    }
    const res = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: productId, isOnOffer: true, offerPrice: price }) })
    if (res.ok) {
      const updated = await res.json()
      setProducts((prev) => prev.map(p => p.id === productId ? updated : p))
      setEditingOffers((prev) => {
        const newMap = new Map(prev)
        newMap.delete(productId)
        return newMap
      })
    } else {
      const err = await res.text().catch(() => 'Error actualizando oferta')
      alert(err)
    }
  }

  async function disableOffer(productId: number) {
    const res = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: productId, isOnOffer: false }) })
    if (res.ok) {
      const updated = await res.json()
      setProducts((prev) => prev.map(p => p.id === productId ? updated : p))
    } else {
      const err = await res.text().catch(() => 'Error desactivando oferta')
      alert(err)
    }
  }

  function toggleOfferEdit(productId: number) {
    setEditingOffers((prev) => {
      const newMap = new Map(prev)
      if (newMap.has(productId)) {
        newMap.delete(productId)
      } else {
        const product = products.find(p => p.id === productId)
        newMap.set(productId, { productId, offerPrice: String(product?.price || '') })
      }
      return newMap
    })
  }

  function handleOfferPriceChange(productId: number, value: string) {
    setEditingOffers((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(productId)
      if (current) {
        newMap.set(productId, { ...current, offerPrice: value })
      }
      return newMap
    })
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Productos</h1>
      <form onSubmit={create} className="mb-6">
        <input placeholder="Titulo" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border p-2 mr-2 mb-2" />
        <input placeholder="Precio" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border p-2 mr-2 mb-2" />
        <input placeholder="Precio anterior" value={form.previousPrice} onChange={e => setForm({ ...form, previousPrice: e.target.value })} className="border p-2 mr-2 mb-2" />
        <input placeholder="Categoría" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border p-2 mr-2 mb-2" />
        <input placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="border p-2 mr-2 mb-2" />
        <input placeholder="Descripcion" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border p-2 mr-2 mb-2" />
        <div>
          <input type="file" accept="image/*" onChange={async (e) => {
            setUploadError('')
            const f = (e.target as HTMLInputElement).files?.[0]
            if (!f) return
            if (f.size > 1024 * 1024 * 2) { setUploadError('La imagen debe ser menor a 2MB'); return }
            if (!f.type.startsWith('image/')) { setUploadError('Formato no válido'); return }
            const reader = new FileReader()
            reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result as string }))
            reader.readAsDataURL(f)
          }} />
          {uploadError && <div className="text-red-600">{uploadError}</div>}
          {form.image && <img src={form.image} alt="Vista previa" className="w-32 h-32 object-cover mt-2" />}
        </div>
        <label className="ml-2">
          <input type="checkbox" checked={form.isOnOffer} onChange={e => setForm({ ...form, isOnOffer: e.target.checked })} /> Oferta
        </label>
        <button type="submit" className="ml-2 bg-green-600 text-white px-3 py-1 rounded">Crear</button>
      </form>

      <ul>
        {products.map(p => {
          const editingOffer = editingOffers.get(p.id)
          return (
          <li key={p.id} className="flex justify-between border-b py-2">
            <div className="flex gap-4 flex-1">
              {p.image && <img src={p.image} alt={p.title} className="w-20 h-20 object-cover" />}
              <div className="flex-1">
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-gray-600">{(p as any).description}</div>
                <div>Precio actual: ${p.price}  Stock: {p.stock}</div>
                {p.isOnOffer && p.previousPrice != null && <div className="text-sm text-slate-500">Precio anterior: ${p.previousPrice}</div>}
                <label className="mt-2 flex items-center gap-2">
                  <input type="checkbox" checked={p.isOnOffer || editingOffer !== undefined} onChange={() => {
                    if (p.isOnOffer && !editingOffer) {
                      disableOffer(p.id)
                    } else {
                      toggleOfferEdit(p.id)
                    }
                  }} />
                  <span className="text-sm">Oferta</span>
                </label>
                {editingOffer && (
                  <div className="mt-2 flex gap-2">
                    <input type="number" value={editingOffer.offerPrice} onChange={(e) => handleOfferPriceChange(p.id, e.target.value)} placeholder="Precio de oferta" className="border p-1 px-2 text-sm w-32" />
                    <button type="button" onClick={() => updateOffer(p.id, editingOffer.offerPrice)} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Guardar</button>
                    <button type="button" onClick={() => toggleOfferEdit(p.id)} className="bg-gray-400 text-white px-2 py-1 rounded text-sm">Cancelar</button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <button type="button" className="text-red-600" onClick={() => remove(p.id)}>Eliminar</button>
            </div>
          </li>
        )})
        }
      </ul>
    </div>
  )
}
