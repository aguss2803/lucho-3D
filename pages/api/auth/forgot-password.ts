import type { NextApiRequest, NextApiResponse } from 'next'
import { addResetRequest } from '../../../lib/resetRequests'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body
  if (!email) return res.status(400).send('Email requerido')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(200).json({ ok: true })

  addResetRequest(user.email)
  return res.json({ ok: true })
}
