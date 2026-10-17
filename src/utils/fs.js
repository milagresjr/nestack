import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const render = (str, vars) => str.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '')

export function writeSafe(path, content, { force = false } = {}) {
  if (existsSync(path) && !force) { console.log(`  ~ já existe, ignorado: ${path}`); return false }
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  console.log(`  + ${path}`)
  return true
}

// Copia uma pasta de templates. "_x.tpl" vira ".x"; ".tpl" é removido.
export function copyTree(src, dest, vars) {
  for (const entry of readdirSync(src)) {
    const from = join(src, entry)
    if (statSync(from).isDirectory()) { copyTree(from, join(dest, entry), vars); continue }
    const name = entry.replace(/^_/, '.').replace(/\.tpl$/, '')
    writeSafe(join(dest, name), render(readFileSync(from, 'utf8'), vars), { force: true })
  }
}
