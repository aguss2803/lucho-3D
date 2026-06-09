import fs from 'fs'
import path from 'path'

type ResetRequest = {
  id: number
  email: string
  createdAt: string
}

const storePath = path.join(process.cwd(), 'data', 'reset-requests.json')

function ensureStore() {
  const dir = path.dirname(storePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(storePath)) fs.writeFileSync(storePath, '[]', 'utf8')
}

export function getResetRequests(): ResetRequest[] {
  ensureStore()
  try {
    const raw = fs.readFileSync(storePath, 'utf8')
    return JSON.parse(raw) as ResetRequest[]
  } catch (err) {
    return []
  }
}

export function addResetRequest(email: string) {
  const requests = getResetRequests()
  if (requests.some((r) => r.email.toLowerCase() === email.toLowerCase())) {
    return requests.find((r) => r.email.toLowerCase() === email.toLowerCase())
  }
  const nextId = requests.length ? Math.max(...requests.map((r) => r.id)) + 1 : 1
  const newRequest = { id: nextId, email, createdAt: new Date().toISOString() }
  requests.push(newRequest)
  fs.writeFileSync(storePath, JSON.stringify(requests, null, 2), 'utf8')
  return newRequest
}

export function removeResetRequest(id: number) {
  const requests = getResetRequests().filter((r) => r.id !== id)
  fs.writeFileSync(storePath, JSON.stringify(requests, null, 2), 'utf8')
}
