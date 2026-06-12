import type { NextApiRequest, NextApiResponse } from 'next'
import { put } from '@vercel/blob'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { filename, data } = req.body
  if (!filename || !data) return res.status(400).json({ error: 'missing' })

  try {
    // 1. Convertimos el string base64 que te llega a un Buffer binario
    const buffer = Buffer.from(data, 'base64')

    // 2. Lo subimos directamente a tu contenedor de Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
    })

    // 3. Devolvemos la URL web real generada por Vercel
    return res.status(200).json({ url: blob.url })
  } catch (error) {
    return res.status(500).json({ error: 'Error al subir a Vercel Blob' })
  }
}
