export const words = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[\s_\-/]+/).filter(Boolean).map((w) => w.toLowerCase())
export const kebab = (s) => words(s).join('-')
export const pascal = (s) => words(s).map((w) => w[0].toUpperCase() + w.slice(1)).join('')
export const camel = (s) => { const p = pascal(s); return p[0].toLowerCase() + p.slice(1) }
