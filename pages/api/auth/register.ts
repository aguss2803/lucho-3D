import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

const PASSWORD_REGEX = /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, password } = req.body
  if (!email || !password) return res.status(400).send('Faltan campos')
  if (!PASSWORD_REGEX.test(password)) return res.status(400).send('Contraseña inválida')
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(400).send('Usuario ya existe')
  const hashed = await hash(password, 10)
  const user = await prisma.user.create({ data: { name: name || null, email, password: hashed, role: 'PENDING' } })
  res.json({ id: user.id })
}
