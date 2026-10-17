import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

let rl
let useDefaults = !stdin.isTTY
const io = () => (rl ??= createInterface({ input: stdin, output: stdout }))

export const setUseDefaults = (v) => { useDefaults = v || !stdin.isTTY }
export const closePrompt = () => rl?.close()

export async function ask(question, def = '') {
  if (useDefaults) return def
  const a = (await io().question(`? ${question}${def ? ` (${def})` : ''}: `)).trim()
  return a || def
}

export async function confirm(question, def = true) {
  if (useDefaults) return def
  const a = (await io().question(`? ${question} ${def ? '(S/n)' : '(s/N)'}: `)).trim().toLowerCase()
  return a ? ['s', 'sim', 'y', 'yes'].includes(a) : def
}

export async function select(question, options, def = 0) {
  if (useDefaults) return options[def].value
  console.log(`? ${question}`)
  options.forEach((o, i) => console.log(`   ${i + 1}) ${o.label}${i === def ? '  (padrão)' : ''}`))
  const a = (await io().question('  Escolha: ')).trim()
  const n = a ? Number(a) - 1 : def
  return (options[n] ?? options[def]).value
}
