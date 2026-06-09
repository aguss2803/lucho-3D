import { useState } from 'react'
import { useRouter } from 'next/router'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const { token } = router.query

  async function submit(e: any) {
    e.preventDefault()
    if (!token) return setMessage('Token inválido')
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    if (res.ok) {
      setMessage('Contraseña actualizada. Ya puedes iniciar sesión.')
    } else {
      const text = await res.text()
      setMessage(text || 'Error al restablecer contraseña')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ingresar nueva contraseña</h1>
      <form onSubmit={submit} className="max-w-md">
        <label className="block mb-2">Nueva contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mt-1" required />
        </label>
        <div className="text-sm text-gray-600 mb-4">Debe contener al menos una letra mayúscula, un número y un signo.</div>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Actualizar contraseña</button>
      </form>
      {message && <div className="mt-4 text-sm text-green-700">{message}</div>}
    </div>
  )
}
