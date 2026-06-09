import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_FILE = /\.(.*)$/

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith('/_next')) return NextResponse.next()

  // Protect admin pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // Check role
    // @ts-ignore
     if (token.role !== 'OWNER') {
       return new NextResponse('Forbidden', { status: 403 })
     }
  }

  // Protect checkout API: require login
  if (pathname.startsWith('/api/checkout')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return new NextResponse('Unauthorized', { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/checkout', '/api/admin/:path*'],
}
