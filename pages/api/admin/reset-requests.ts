import type { NextApiRequest, NextApiResponse } from 'next'
import { getResetRequests, removeResetRequest } from '../../../lib/resetRequests'
import { prisma } from '../../../lib/prisma'
import { hash } from 'bcryptjs'

function randomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:\\|,.<>/?'
  let pass = ''
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)]
  return pass
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.json(getResetRequests())
  }

  if (req.method === 'POST') {
    const { id, action } = req.body
    if (!id || !action) return res.status(400).send('Bad request')

    const requestId = Number(id)
    if (action === 'accept') {
      const requests = getResetRequests()
      const request = requests.find((r) => r.id === requestId)
      if (!request) return res.status(404).send('Request not found')
      const user = await prisma.user.findUnique({ where: { email: request.email } })
      if (!user) {
        removeResetRequest(requestId)
        return res.status(404).send('Usuario no encontrado')
      }
      const newPassword = randomPassword()
      const hashed = await hash(newPassword, 10)
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
      removeResetRequest(requestId)
      return res.json({ ok: true, email: user.email, newPassword })
    }

    if (action === 'reject') {
      removeResetRequest(requestId)
      return res.json({ ok: true })
    }
  }

  res.status(405).end()
}
