import { useEffect, useState } from 'react'

type Pending = { id: number; email: string; name?: string }

export default function Acceptance() {
  const [pending, setPending] = useState<Pending[]>([])

  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(setPending) }, [])

  async function take(id: number, action: 'accept'|'reject') {
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    if (res.ok) setPending((p) => p.filter(x => x.id !== id))
    else alert('Error')
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Aceptación de nuevos clientes</h1>
      <p className="mb-4">Lista de cuentas solicitadas. Acepte para permitir que el cliente inicie sesión y compre.</p>
      <ul>
        {pending.map(u => (
          <li key={u.id} className="flex justify-between border-b py-2">
            <div>
              <div className="font-semibold">{u.name || u.email}</div>
              <div className="text-sm text-gray-600">{u.email}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => take(u.id, 'accept')} className="bg-green-600 text-white px-3 py-1 rounded">Aceptar</button>
              <button onClick={() => take(u.id, 'reject')} className="bg-red-600 text-white px-3 py-1 rounded">Rechazar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
