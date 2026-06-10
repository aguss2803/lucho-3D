import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { filename, data } = req.body
  if (!filename || !data) return res.status(400).json({ error: 'missing' })
  const buffer = Buffer.from(data, 'base64')
  const savePath = path.join(process.cwd(), 'public', 'images', filename)
  fs.writeFileSync(savePath, buffer)
  res.json({ url: `/images/${filename}` })
}
