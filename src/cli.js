import { parseArgs } from 'node:util'
import { newProject } from './commands/new.js'
import { make, MAKERS } from './commands/make.js'
import { setUseDefaults } from './utils/prompt.js'

const HELP = `nestack

Uso:
  nestack new <nome> [--yes]               Cria um projeto Nest (perguntas interativas; --yes usa os padrões)
  nestack make:<tipo> <nome> [--module=x]  Gera arquivo(s) com código base
  nestack migrate [nome]                   Atalho para prisma migrate dev
  nestack db:seed                          Atalho para prisma db seed

Tipos: ${Object.keys(MAKERS).join(', ')}, resource`

export async function run(argv) {
  const { values, positionals } = parseArgs({
    args: argv, allowPositionals: true,
    options: { module: { type: 'string', short: 'm' }, force: { type: 'boolean', short: 'f' }, yes: { type: 'boolean', short: 'y' } },
  })
  const [cmd, name] = positionals
  setUseDefaults(values.yes)
  try {
    if (cmd === 'new' && name) return await newProject(name)
    if (cmd?.startsWith('make:') && name) return make(cmd.slice(5), name, values)
    if (cmd === 'migrate') return (await import('./commands/prisma.js')).migrate(name)
    if (cmd === 'db:seed') return (await import('./commands/prisma.js')).seed()
  } catch (e) { console.error(`Erro: ${e.message}`); process.exit(1) }
  console.log(HELP)
}
