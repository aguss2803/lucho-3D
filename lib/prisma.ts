import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma ?? new PrismaClient() // eslint-disable-line no-unused-vars
if (process.env.NODE_ENV !== 'production') global.prisma = prisma
