import { spawnSync } from 'node:child_process'
import { generateKeyPairSync } from 'node:crypto'
import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyTree, writeSafe } from '../utils/fs.js'
import { kebab } from '../utils/names.js'
import { findFreePort, isPortFree } from '../utils/net.js'
import { ask, closePrompt, confirm, select } from '../utils/prompt.js'
import * as g from '../scaffold/generators.js'

const T = join(dirname(fileURLToPath(import.meta.url)), '../../templates')

const run = (cmd, args, cwd, { soft = false } = {}) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd, shell: process.platform === 'win32' })
  if (r.status && !soft) throw new Error(`falhou: ${cmd} ${args.join(' ')}`)
  return r.status === 0
}

// ---------------------------------------------------------------- perguntas
async function askAnswers(app) {
  const dbName = app.replace(/-/g, '_')
  const a = { app, db: { user: 'postgres', password: 'postgres', name: dbName, port: 5432 } }

  console.log('\nVamos configurar o projeto (Enter aceita o padrão).\n')

  a.docker = await confirm('Usar Docker para o Postgres (compose.yaml)?', true)
  if (a.docker) {
    let port = 5432
    if (!(await isPortFree(port))) {
      const free = await findFreePort(5433)
      console.log(`  ! A porta 5432 já está em uso (provavelmente um Postgres local). Sugestão: ${free}`)
      port = free
    }
    a.db.port = Number(await ask('Porta do Postgres no seu computador', String(port)))
    if (!(await isPortFree(a.db.port))) console.log(`  ! Atenção: a porta ${a.db.port} parece ocupada.`)
    a.databaseUrl = `postgresql://${a.db.user}:${a.db.password}@localhost:${a.db.port}/${a.db.name}?schema=public`
  } else {
    a.databaseUrl = await ask('DATABASE_URL do Postgres', `postgresql://postgres:postgres@localhost:5432/${dbName}?schema=public`)
  }

  a.auth = await confirm('Incluir autenticação JWT (RS256, guard, strategy)?', true)
  a.storage = await select('Storage de arquivos:', [
    { label: 'Nenhum', value: null },
    { label: 'Cloudflare R2', value: 'r2' },
    { label: 'Backblaze B2', value: 'b2' },
  ], 0)
  a.cache = await confirm('Incluir cache com Redis?', false)
  a.redisPort = 6379
  if (a.cache && a.docker) {
    a.redisPort = (await isPortFree(6379)) ? 6379 : await findFreePort(6380)
    if (a.redisPort !== 6379) console.log(`  ! Porta 6379 ocupada, usando ${a.redisPort} para o Redis.`)
  }
  if (a.auth) {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })
    a.keys = { privateKey: Buffer.from(privateKey).toString('base64'), publicKey: Buffer.from(publicKey).toString('base64') }
  }
  return a
}

// ---------------------------------------------------------------- comando
export async function newProject(name) {
  const app = kebab(name)
  const dest = resolve(app)
  if (existsSync(dest)) throw new Error(`a pasta "${app}" já existe`)

  const a = await askAnswers(app)

  console.log('\n1/4 Criando projeto Nest...')
  run('npx', ['--yes', '@nestjs/cli', 'new', app, '--package-manager', 'npm', '--skip-git', '--strict'])

  console.log('\n2/4 Instalando dependências...')
  const deps = ['@prisma/client@6', '@prisma/adapter-pg@6', 'pg', 'zod', 'bcryptjs', 'dotenv', '@nestjs/config', '@nestjs/swagger']
  const dev = ['prisma@6', '@types/pg', 'tsx', 'vitest', '@vitest/coverage-v8', 'unplugin-swc', '@swc/core']
  if (a.auth) { deps.push('@nestjs/jwt', '@nestjs/passport', 'passport', 'passport-jwt'); dev.push('@types/passport-jwt') }
  if (a.storage) deps.push('@aws-sdk/client-s3')
  if (a.cache) deps.push('ioredis')
  // troca o Jest (padrão do Nest) pelo Vitest
  run('npm', ['rm', 'jest', 'ts-jest', '@types/jest'], dest, { soft: true })
  run('npm', ['i', ...deps], dest)
  run('npm', ['i', '-D', ...dev], dest)

  console.log('\n3/4 Aplicando a arquitetura...')
  scaffold(dest, a)

  console.log('\n4/4 Gerando Prisma Client...')
  run('npx', ['prisma', 'generate'], dest)

  await closeAndFinish(dest, a)
}

async function closeAndFinish(dest, a) {
  let started = false
  if (a.docker && (await confirm('Subir o banco agora e rodar a migration inicial?', true))) {
    console.log('\nSubindo containers (aguarda o healthcheck)...')
    const up = run('docker', ['compose', 'up', '-d', '--wait'], dest, { soft: true })
    if (!up) console.log('  ! Não consegui subir o Docker. Ele está rodando? Tente: docker compose up -d --wait')
    else started = run('npx', ['prisma', 'migrate', 'dev', '--name', 'init'], dest, { soft: true })
    if (up && !started) console.log(`  ! Migration falhou. Confira o DATABASE_URL no .env (porta ${a.db.port}).`)
  }
  closePrompt()
  const steps = [`cd ${a.app}`]
  if (a.docker && !started) steps.push('docker compose up -d --wait', 'npx prisma migrate dev --name init')
  steps.push('npm run start:dev')
  console.log(`\nPronto! Próximos passos:\n  ${steps.join('\n  ')}\n  Swagger: http://localhost:3333/docs`)
  if (a.storage) console.log('  Lembre de preencher as variáveis STORAGE_* no .env')
}

// ---------------------------------------------------------------- scaffold
export function scaffold(dest, a) {
  // remove o que o Nest gera e que muda de lugar
  for (const f of ['src/app.controller.ts', 'src/app.controller.spec.ts', 'src/app.service.ts', 'src/app.module.ts', 'src/main.ts'])
    rmSync(join(dest, f), { force: true })
  rmSync(join(dest, 'test'), { recursive: true, force: true })

  const vars = { APP_NAME: a.app }
  copyTree(join(T, 'base'), dest, vars)
  if (a.auth) copyTree(join(T, 'features/auth'), dest, vars)
  if (a.storage) copyTree(join(T, 'features/storage'), dest, vars)
  if (a.cache) copyTree(join(T, 'features/cache'), dest, vars)

  const w = (p, c) => writeSafe(join(dest, p), c, { force: true })
  w('src/infra/env/env.ts', g.envTs(a))
  w('src/infra/app.module.ts', g.appModule(a))
  w('src/infra/cryptography/cryptography.module.ts', g.cryptographyModule(a))
  w('.env', g.envFile(a))
  w('.env.example', g.envFile(a, { example: true }))
  w('prisma.config.ts', g.prismaConfig())
  if (a.docker) w('compose.yaml', g.dockerCompose(a))
  for (const d of g.SKELETON_DIRS) writeSafe(join(dest, d, '.gitkeep'), '', { force: false })

  const gi = join(dest, '.gitignore')
  const cur = existsSync(gi) ? readFileSync(gi, 'utf8') : ''
  if (!/^\.env$/m.test(cur)) appendFileSync(gi, '\n.env\n')
  if (!/^\/generated$/m.test(cur)) appendFileSync(gi, '\n/generated\n')

  patchProject(dest)
}

function patchProject(dest) {
  const edit = (file, fn) => {
    const p = join(dest, file)
    if (!existsSync(p)) return
    const json = JSON.parse(readFileSync(p, 'utf8'))
    fn(json)
    writeFileSync(p, JSON.stringify(json, null, 2) + '\n')
  }
  edit('package.json', (pkg) => {
    delete pkg.jest
    // Nest 12 scaffolds ESM (type: module + nodenext), mas o template usa imports
    // relativos sem extensão (padrão CJS). Voltamos para CJS.
    delete pkg.type
    pkg.scripts = {
      ...pkg.scripts,
      postinstall: 'prisma generate',
      // generated fica na raiz (fora de src/), então o dist replica src/ e generated/
      'start:prod': 'node dist/src/infra/main',
      test: 'vitest run',
      'test:watch': 'vitest',
      'test:cov': 'vitest run --coverage',
      'test:debug': 'vitest --inspect-brk --no-file-parallelism',
      'test:e2e': 'vitest run --config vitest.config.e2e.ts',
      'db:generate': 'prisma generate', 'db:migrate': 'prisma migrate dev',
      'db:deploy': 'prisma migrate deploy', 'db:seed': 'prisma db seed',
    }
  })
  // generated/ vive na raiz (fora de src/), então rootDir="." e o entry fica em dist/src/...
  edit('nest-cli.json', (c) => { c.entryFile = 'src/infra/main' })
  edit('tsconfig.json', (ts) => {
    // TS 6 (padrão do Nest 12) deprecou baseUrl (TS5101); paths já são relativos.
    delete ts.compilerOptions.baseUrl
    ts.compilerOptions.paths = { '@/*': ['./src/*'], 'generated/*': ['./generated/*'] }
    // declaration: true (padrão do Nest 12) quebra o emit .d.ts do Prisma client (TS4094).
    ts.compilerOptions.declaration = false
  })
  edit('tsconfig.build.json', (ts) => {
    // generated/ vive na raiz (fora de src/), então rootDir="." cobre src/ e generated/.
    ts.compilerOptions.rootDir = '.'
    ts.include = ['src', 'generated']
    ts.exclude = [...new Set([...(ts.exclude ?? []), 'src/test', 'prisma', 'vitest.config.ts', 'vitest.config.e2e.ts'])]
  })
}
