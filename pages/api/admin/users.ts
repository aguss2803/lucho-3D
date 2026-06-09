import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const pending = await prisma.user.findMany({ where: { role: 'PENDING' }, select: { id: true, email: true, name: true, createdAt: true } })
    res.json(pending)
    return
  }

  if (req.method === 'POST') {
    const { id, action } = req.body
    if (!id || !action) return res.status(400).send('Bad request')
    if (action === 'accept') {
      const u = await prisma.user.update({ where: { id: Number(id) }, data: { role: 'USER' } })
      res.json(u)
      return
    }
    if (action === 'reject') {
      await prisma.user.delete({ where: { id: Number(id) } })
      res.json({ ok: true })
      return
    }
  }

  res.status(405).end()
}
