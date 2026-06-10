import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+/

export default function Account() {
  const { data: session } = useSession()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => { if (session?.user) setName((session.user as any).name || '') }, [session])

  async function save(e: any) {
    e.preventDefault()
    const res = await fetch('/api/user/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    if (res.ok) alert('Guardado')
    else alert('Error')
  }

  async function changePw(e: any) {
    e.preventDefault()
    if (!currentPassword || !password || !confirmPassword) return alert('Complete todos los campos de contraseña')
    if (password !== confirmPassword) return alert('Las contraseñas nuevas deben coincidir')
    if (!PASSWORD_REGEX.test(password)) return alert('La contraseña debe incluir una letra mayúscula, un número y un signo')
    const res = await fetch('/api/user/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, password }) })
    if (res.ok) {
      alert('Contraseña actualizada')
      setCurrentPassword('')
      setPassword('')
      setConfirmPassword('')
    } else {
      const text = await res.text()
      alert(text || 'Error')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Mi cuenta</h1>
      <form onSubmit={save} className="mb-6">
        <label className="block mb-2">Nombre
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>

      <form onSubmit={changePw}>
        <h2 className="text-xl font-semibold mb-3">Cambiar contraseña</h2>
        <label className="block mb-2">Contraseña actual
          <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <label className="block mb-2">Nueva contraseña
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <label className="block mb-4">Repetir contraseña
          <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="w-full border p-2 mt-1" />
        </label>
        <div className="text-sm text-gray-600 mb-4">Debe contener al menos una letra mayúscula, un número y un signo.</div>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Cambiar contraseña</button>
      </form>
    </div>
  )
}
