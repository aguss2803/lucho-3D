import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function submit(e: any) {
    e.preventDefault()
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res && res.ok) router.push('/home')
    else alert('Credenciales inválidas')
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <form onSubmit={submit} className="max-w-md">
        <label className="block mb-2">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <label className="block mb-2">Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
      </form>
      <div className="mt-4 flex flex-col gap-2">
        <button onClick={() => router.push('/register')} className="text-sky-600 underline">Crear cuenta</button>
        <button onClick={() => router.push('/home')} className="text-slate-700 underline">Continuar como invitado</button>
        <button onClick={() => router.push('/forgot-password')} className="text-red-600 underline">Olvidaste tu contraseña?</button>
      </div>
    </div>
  )
}
