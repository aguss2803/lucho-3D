import { useEffect, useState } from 'react'

type Request = { id: number; email: string; createdAt: string }

export default function ResetRequestsAdmin() {
  const [requests, setRequests] = useState<Request[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/reset-requests').then((r) => r.json()).then(setRequests)
  }, [])

  async function handle(id: number, action: 'accept' | 'reject') {
    const res = await fetch('/api/admin/reset-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    if (!res.ok) {
      setMessage('Error procesando la solicitud')
      return
    }
    const data = await res.json()
    setRequests((prev) => prev.filter((item) => item.id !== id))
    if (action === 'accept') {
      setMessage(`Contraseña cambiada. Debe enviar un email al cliente (${data.email}) con la nueva contraseña: ${data.newPassword}`)
      window.alert(`Recuerda enviar un mail al cliente (${data.email}) con la nueva contraseña: ${data.newPassword}`)
      // Refetch requests after action
      setTimeout(() => {
        fetch('/api/admin/reset-requests').then((r) => r.json()).then(setRequests)
      }, 500)
    } else {
      setMessage('Solicitud rechazada.')
      // Refetch requests after action
      setTimeout(() => {
        fetch('/api/admin/reset-requests').then((r) => r.json()).then(setRequests)
      }, 500)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Peticiones de blanqueo de contraseña</h1>
      <p className="mb-4">Aquí se alojan las solicitudes de restablecimiento de contraseña. Al aceptar, el sistema generará una contraseña aleatoria y te recordará enviar el mail.</p>
      {message && <div className="mb-4 rounded-lg bg-yellow-100 p-3 text-slate-800">{message}</div>}
      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req.id} className="rounded-2xl border bg-white p-4 shadow-sm flex flex-col gap-3">
            <div><strong>Email:</strong> {req.email}</div>
            <div className="text-sm text-slate-500">Solicitado el {new Date(req.createdAt).toLocaleString()}</div>
            <div className="flex gap-2">
              <button onClick={() => handle(req.id, 'accept')} className="rounded bg-green-600 px-3 py-2 text-white">Aceptar</button>
              <button onClick={() => handle(req.id, 'reject')} className="rounded bg-red-600 px-3 py-2 text-white">Rechazar</button>
            </div>
          </li>
        ))}
        {requests.length === 0 && <div className="text-slate-600">No hay solicitudes pendientes.</div>}
      </ul>
    </div>
  )
}
