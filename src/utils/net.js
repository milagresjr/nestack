import { createServer } from 'node:net'

export const isPortFree = (port) =>
  new Promise((resolve) => {
    const s = createServer()
    s.once('error', () => resolve(false))
    s.once('listening', () => s.close(() => resolve(true)))
    s.listen(port)
  })

export async function findFreePort(start) {
  for (let p = start; p < start + 50; p++) if (await isPortFree(p)) return p
  return start
}
