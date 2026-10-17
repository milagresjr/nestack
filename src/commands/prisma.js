import { spawnSync } from 'node:child_process'
const sh = (args) => { const r = spawnSync('npx', ['prisma', ...args], { stdio: 'inherit' }); if (r.status) process.exit(r.status) }
export const migrate = (name) => sh(['migrate', 'dev', ...(name ? ['--name', name] : [])])
export const seed = () => sh(['db', 'seed'])
