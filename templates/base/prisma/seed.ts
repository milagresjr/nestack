import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../generated/prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool, { disposeExternalPool: true })
const prisma = new PrismaClient({ adapter })

async function main() {
  // await prisma.user.create({ data: { name, email, password } })
}

main().finally(() => prisma.$disconnect())
