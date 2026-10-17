import { Pool } from 'pg'

let pool: Pool | undefined

export function getDatabasePool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL não definida')
    }
    pool = new Pool({ connectionString })
  }
  return pool
}

export function getDatabaseSchema() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return undefined
  }
  return new URL(connectionString).searchParams.get('schema') ?? undefined
}
