// Arquivos que dependem das respostas do usuário são montados aqui.

export function envTs(a) {
  const f = ['  DATABASE_URL: z.string().url(),', '  PORT: z.coerce.number().default(3333),']
  if (a.auth) f.push('  JWT_PRIVATE_KEY: z.string(),', '  JWT_PUBLIC_KEY: z.string(),')
  if (a.storage) f.push(
    '  STORAGE_ENDPOINT: z.string().url(),', "  STORAGE_REGION: z.string().default('auto'),",
    '  STORAGE_BUCKET: z.string(),', '  STORAGE_ACCESS_KEY_ID: z.string(),', '  STORAGE_SECRET_ACCESS_KEY: z.string(),')
  if (a.cache) f.push("  REDIS_HOST: z.string().default('127.0.0.1'),", '  REDIS_PORT: z.coerce.number().default(6379),', '  REDIS_DB: z.coerce.number().default(0),')
  return `import { z } from 'zod'\n\nexport const envSchema = z.object({\n${f.join('\n')}\n})\n\nexport type Env = z.infer<typeof envSchema>\n`
}

export function envFile(a, { example = false } = {}) {
  const v = (x) => (example ? '' : x)
  const l = []
  if (a.docker) l.push(`# Usadas pelo compose.yaml`, `DB_USER=${a.db.user}`, `DB_PASSWORD=${a.db.password}`, `DB_NAME=${a.db.name}`, `DB_PORT=${a.db.port}`, '')
  l.push(`DATABASE_URL="${a.databaseUrl}"`, 'PORT=3333')
  if (a.auth) l.push('', `JWT_PRIVATE_KEY="${v(a.keys.privateKey)}"`, `JWT_PUBLIC_KEY="${v(a.keys.publicKey)}"`)
  if (a.storage) {
    // placeholders precisam ser URLs válidas: o zod rejeita "<regiao>" no boot
    const endpoint = a.storage === 'b2' ? 'https://s3.us-east-1.backblazeb2.com' : 'https://exemplo.r2.cloudflarestorage.com'
    const region = a.storage === 'b2' ? 'us-east-1' : 'auto'
    l.push('', `# ${a.storage === 'b2' ? 'Backblaze B2' : 'Cloudflare R2'} (S3-compatível)`, `STORAGE_ENDPOINT="${endpoint}"`,
      `STORAGE_REGION="${region}"`, 'STORAGE_BUCKET=""', 'STORAGE_ACCESS_KEY_ID=""', 'STORAGE_SECRET_ACCESS_KEY=""')
  }
  if (a.cache) l.push('', `REDIS_HOST=127.0.0.1`, `REDIS_PORT=${a.redisPort}`, 'REDIS_DB=0')
  return l.join('\n') + '\n'
}

export function dockerCompose(a) {
  let y = `services:
  postgres:
    image: postgres:18
    container_name: ${a.app}-postgres
    restart: unless-stopped
    ports:
      - "\${DB_PORT}:5432"
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER} -d \${DB_NAME}"]
      interval: 3s
      timeout: 3s
      retries: 20
`
  if (a.cache) y += `
  redis:
    image: redis
    container_name: ${a.app}-redis
    restart: unless-stopped
    ports:
      - "\${REDIS_PORT}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 3s
      timeout: 3s
      retries: 20
`
  return y + '\nvolumes:\n  pgdata:\n'
}

export function appModule(a) {
  const imp = [
    ["ConfigModule", "@nestjs/config"],
    ["EnvModule", "./env/env.module"],
    ["DatabaseModule", "./database/database.module"],
    ["CryptographyModule", "./cryptography/cryptography.module"],
    ["EventsModule", "./events/events.module"],
    ["HttpModule", "./http/http.module"],
  ]
  if (a.auth) imp.push(['AuthModule', './auth/auth.module'])
  if (a.storage) imp.push(['StorageModule', './storage/storage.module'])
  if (a.cache) imp.push(['CacheModule', './cache/cache.module'])
  const lines = imp.map(([n, p]) => `import { ${n} } from '${p}'`)
  const mods = imp.map(([n]) => (n === 'ConfigModule' ? '    ConfigModule.forRoot({ validate: (env) => envSchema.parse(env), isGlobal: true }),' : `    ${n},`))
  return `import { Module } from '@nestjs/common'\nimport { envSchema } from './env/env'\n${lines.join('\n')}\n\n@Module({\n  imports: [\n${mods.join('\n')}\n  ],\n})\nexport class AppModule {}\n`
}

export function cryptographyModule(a) {
  const imp = [
    "import { Module } from '@nestjs/common'",
    "import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer'",
    "import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'",
    "import { BcryptHasher } from './bcrypt-hasher'",
  ]
  const prov = ['    { provide: HashComparer, useClass: BcryptHasher },', '    { provide: HashGenerator, useClass: BcryptHasher },']
  const exp = ['HashComparer', 'HashGenerator']
  if (a.auth) {
    imp.splice(1, 0, "import { Encrypter } from '@/domain/forum/application/cryptography/encrypter'")
    imp.push("import { JwtEncrypter } from './jwt-encrypter'")
    prov.unshift('    { provide: Encrypter, useClass: JwtEncrypter },')
    exp.unshift('Encrypter')
  }
  return `${imp.join('\n')}\n\n@Module({\n  providers: [\n${prov.join('\n')}\n  ],\n  exports: [${exp.join(', ')}],\n})\nexport class CryptographyModule {}\n`
}

export const SKELETON_DIRS = [
  'src/core/errors/errors', 'src/core/repositories',
  'src/domain/forum/enterprise/entities/value-objects', 'src/domain/forum/enterprise/events',
  'src/domain/forum/application/use-cases/errors', 'src/domain/forum/application/repositories',
  'src/domain/notification/enterprise/entities', 'src/domain/notification/application/use-cases',
  'src/domain/notification/application/repositories', 'src/domain/notification/application/subscribers',
  'src/infra/database/prisma/mappers', 'src/infra/database/prisma/repositories',
  'src/infra/http/controllers', 'src/infra/http/dtos', 'src/infra/http/presenters',
  'src/test/factories', 'src/test/repositories', 'src/test/e2e', 'src/test/utils',
]

// Substitui package.json#prisma (deprecated no Prisma 6.19, removido no 7).
export function prismaConfig() {
  return `import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
})
`
}
