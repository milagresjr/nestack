import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, writeSafe } from '../utils/fs.js'
import { camel, kebab, pascal } from '../utils/names.js'

const TPL = join(dirname(fileURLToPath(import.meta.url)), '../../templates/make')

// tipo -> { template, caminho do arquivo, sufixo da classe }
export const MAKERS = {
  entity:     { tpl: 'entity.ts.tpl',     path: (v) => `src/domain/${v.module}/enterprise/entities/${v.kebab}.ts`, suffix: '' },
  repository: { tpl: 'repository.ts.tpl', path: (v) => `src/domain/${v.module}/application/repositories/${v.kebab}-repository.ts`, suffix: 'Repository' },
  'use-case': { tpl: 'use-case.ts.tpl',   path: (v) => `src/domain/${v.module}/application/use-cases/${v.kebab}.ts`, suffix: 'UseCase' },
  controller: { tpl: 'controller.ts.tpl', path: (v) => `src/infra/http/controllers/${v.kebab}.controller.ts`, suffix: 'Controller' },
  module:     { tpl: 'module.ts.tpl',     path: (v) => `src/infra/http/${v.kebab}.module.ts`, suffix: 'Module' },
  dto:        { tpl: 'dto.ts.tpl',        path: (v) => `src/infra/http/dtos/${v.kebab}.dto.ts`, suffix: 'Dto' },
  presenter:  { tpl: 'presenter.ts.tpl',  path: (v) => `src/infra/http/presenters/${v.kebab}-presenter.ts`, suffix: 'Presenter' },
  event:      { tpl: 'event.ts.tpl',      path: (v) => `src/domain/${v.module}/enterprise/events/${v.kebab}-event.ts`, suffix: 'Event' },
}

export function make(type, name, opts = {}) {
  if (type === 'resource') {
    // entity + repository + use-case + dto + controller + presenter + module
    for (const t of ['entity', 'repository', 'use-case', 'dto', 'controller', 'presenter', 'module']) {
      const n = ['use-case', 'controller', 'dto'].includes(t) ? `create-${name}` : name
      make(t, n, { ...opts, module: opts.module ?? kebab(name) })
    }
    console.log('\nLembre de importar o módulo no AppModule.')
    return
  }
  const m = MAKERS[type]
  if (!m) throw new Error(`tipo desconhecido: "${type}"`)

  const base = kebab(name)
  const vars = {
    kebab: base, Pascal: pascal(name), camel: camel(name),
    module: opts.module ? kebab(opts.module) : base.replace(/^(create|update|delete|get|list|fetch)-/, ''),
  }
  const content = render(readFileSync(join(TPL, m.tpl), 'utf8'), vars)
  writeSafe(m.path(vars), content, { force: opts.force })
}
