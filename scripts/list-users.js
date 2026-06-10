const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany()
    console.log('USERS:', JSON.stringify(users, null, 2))
  } catch (e) {
    console.error('ERROR', e)
  } finally {
    await prisma.$disconnect()
  }
})()
