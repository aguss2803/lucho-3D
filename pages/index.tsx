import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function Landing() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (session) {
      router.replace('/home')
    }
  }, [session, router])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/3d-printer-with-filament-spools-workshop.jpg')" }}>
      <div className="backdrop-brightness-75 w-full h-full absolute top-0 left-0" />
      <div className="relative z-10 text-center p-6">
        <div className="mx-auto w-40 h-40 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push('/login')}>
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-xl font-semibold text-slate-800 hover:opacity-90">Entrar</div>
        </div>
        <div className="mt-6 text-white/80">Inicia sesión para continuar.</div>
      </div>
    </div>
  )
}
