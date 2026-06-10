import { useState } from 'react'
import { useRouter } from 'next/router'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function submit(e: any) {
    e.preventDefault()
    const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    if (res.ok) {
      setMessage('Solicitud registrada. El administrador revisará el pedido de blanqueo de contraseña.')
    } else {
      setMessage('Error procesando la solicitud.')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Recuperar contraseña</h1>
      <form onSubmit={submit} className="max-w-md">
        <label className="block mb-2">Email de comprobación
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mt-1" required />
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Enviar enlace</button>
      </form>
      {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
      <button onClick={() => router.push('/login')} className="mt-4 text-slate-700 underline">Volver a iniciar sesión</button>
    </div>
  )
}
