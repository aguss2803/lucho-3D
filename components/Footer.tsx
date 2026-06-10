export default function Footer() {
  return (
    <footer className="bg-slate-100 text-slate-700 mt-12 border-t">
      <div className="container mx-auto p-6 flex justify-between items-center">
        <div>
          <div className="font-bold">Lucho 3D</div>
          <div className="text-sm">Productos impresos en 3D, personalizados y de alta calidad.</div>
        </div>
        <div className="text-sm flex flex-col gap-1">
          {/* Panel link removed for non-admin users */}
          <a className="hover:underline text-teal-600 flex items-center gap-2" href="mailto:contacto@lucho3d.example"> 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg> contacto@lucho3d.example
          </a>
          <a className="hover:underline text-teal-600 flex items-center gap-2" href="https://instagram.com/lucho3d" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="3"/></svg> @lucho3d
          </a>
          <a className="hover:underline text-teal-600 flex items-center gap-2" href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 01-2 2h-1l-3 3-3-3H8a2 2 0 01-2-2V6a2 2 0 012-2h11a2 2 0 012 2z"/></svg> WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}
