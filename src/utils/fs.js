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

// Copia uma pasta de templates. "_x" vira ".x" (arquivos e diretórios); ".tpl" é removido.
export function copyTree(src, dest, vars) {
  const rename = (n) => n.replace(/^_/, '.').replace(/\.tpl$/, '')
  for (const entry of readdirSync(src)) {
    const from = join(src, entry)
    const to = join(dest, rename(entry))
    if (statSync(from).isDirectory()) { copyTree(from, to, vars); continue }
    writeSafe(to, render(readFileSync(from, 'utf8'), vars), { force: true })
  }
}
