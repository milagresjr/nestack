import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { afterAll, beforeAll } from 'vitest'
import { PrismaClient } from 'generated/prisma/client'

// Cada arquivo de teste e2e roda em um schema Postgres próprio e isolado.
const schemaId = `test_${randomUUID().replace(/-/g, '')}`
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool, {
  schema: schemaId,
  disposeExternalPool: true,
})
const prisma = new PrismaClient({ adapter })

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não definida')
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

beforeAll(async () => {
  process.env.DATABASE_URL = generateUniqueDatabaseURL(schemaId)
  execSync('npx prisma migrate deploy', { stdio: 'ignore' })
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
