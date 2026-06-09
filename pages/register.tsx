import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function submit(e: any) {
    e.preventDefault()
    const passwordValid = /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+/.test(password)
    if (!passwordValid) {
      alert('La contraseña debe incluir una letra mayúscula, un número y un signo.')
      return
    }
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
    if (res.ok) {
      alert('Solicitud enviada. El administrador debe aceptar tu cuenta antes de poder comprar.')
      router.push('/')
    } else {
      const txt = await res.text()
      alert('Error: ' + txt)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
      <form onSubmit={submit} className="max-w-md">
        <label className="block mb-2">Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <label className="block mb-2">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <label className="block mb-2">Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Enviar solicitud</button>
      </form>
    </div>
  )
}
