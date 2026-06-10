import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../lib/prisma'
import { hash, compare } from 'bcryptjs'

const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return res.status(401).end()
  const { currentPassword, password } = req.body
  if (!currentPassword || !password) return res.status(400).send('Faltan campos')
  if (!PASSWORD_REGEX.test(password)) return res.status(400).send('Contraseña inválida')

  const userId = Number((token as any).sub)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return res.status(404).send('Usuario no encontrado')

  const matches = await compare(currentPassword, user.password)
  if (!matches) return res.status(400).send('Contraseña actual incorrecta')

  const hashed = await hash(password, 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  res.json({ ok: true })
}
