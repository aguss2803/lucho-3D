import type { NextApiRequest, NextApiResponse } from 'next'
import { verify } from 'jsonwebtoken'
import { hash } from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret'
const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token, password } = req.body
  if (!token || !password) return res.status(400).send('Token y contraseña requeridos')
  if (!PASSWORD_REGEX.test(password)) return res.status(400).send('Contraseña inválida')

  try {
    const payload = verify(token, PASSWORD_RESET_SECRET) as { email: string }
    if (!payload?.email) return res.status(400).send('Token inválido')

    const user = await prisma.user.findUnique({ where: { email: payload.email } })
    if (!user) return res.status(404).send('Usuario no encontrado')

    const hashed = await hash(password, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return res.json({ ok: true })
  } catch (err) {
    console.error('Reset password error', err)
    return res.status(400).send('Token inválido o expirado')
  }
}
