# nestack

> CLI to **create and evolve NestJS projects** with **DDD** and **Prisma**.

**English** · [Português (BR)](./README.pt-BR.md)

[![npm version](https://img.shields.io/npm/v/nestack.svg)](https://www.npmjs.com/package/nestack)
[![npm downloads](https://img.shields.io/npm/dm/nestack.svg)](https://www.npmjs.com/package/nestack)
[![license](https://img.shields.io/npm/l/nestack.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/nestack.svg)](https://www.npmjs.com/package/nestack)
[![website](https://img.shields.io/badge/website-milagresjr.github.io%2Fnestack-4c6ef5)](https://milagresjr.github.io/nestack/)

`nestack` is a **NestJS CLI** that generates a project already structured with layered
architecture (domain / infra), **Prisma with driver adapters** (`@prisma/adapter-pg`),
Zod validation, Swagger docs, Vitest tests and optional JWT auth — and then keeps
evolving it with code generators.

Live site: <https://milagresjr.github.io/nestack/>

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Create a project](#create-a-project)
- [Generate code](#generate-code)
- [Commands](#commands)
- [Generated stack](#generated-stack)
- [Maintainer publishing](#maintainer-publishing)
- [License](#license)

## Requirements

- Node.js >= 18
- npm
- Docker (optional, to run Postgres through `compose.yaml`)

## Installation

Globally:

```bash
npm install -g nestack
```

Or run it straight from `npx`:

```bash
npx nestack new my-app
```

## Create a project

```bash
nestack new my-app          # interactive questions
nestack new my-app --yes    # accept the defaults
```

While creating, the CLI asks whether you want:

- Postgres via Docker (`compose.yaml`) and on which port
- JWT authentication (RS256)
- File storage (Cloudflare R2 or Backblaze B2)
- Redis cache

After creating it:

```bash
cd my-app
docker compose up -d --wait
npx prisma migrate dev --name init
npm run start:dev
```

The API runs at `http://localhost:3333` and Swagger at `http://localhost:3333/docs`.

## Generate code

```bash
nestack make:<type> <name> [-m <module>]
```

Available types:

| Type         | Description                                     |
| ------------ | ----------------------------------------------- |
| `entity`     | Domain entity                                   |
| `repository` | Repository contract                             |
| `use-case`   | Use case                                        |
| `controller` | HTTP controller                                 |
| `module`     | Nest module                                     |
| `dto`        | DTO (Zod schema)                                |
| `presenter`  | HTTP presenter                                  |
| `event`      | Domain event                                    |
| `resource`   | Full set (entity, repo, use-case, ...)          |

Examples:

```bash
nestack make:entity user -m forum
nestack make:use-case create-user -m forum
nestack make:controller create-user -m forum
nestack make:resource user -m forum
```

## Commands

```bash
nestack new <name> [--yes]               Create a Nest project
nestack make:<type> <name> [--module=x]  Generate file(s) with base code
nestack migrate [name]                   Shortcut for prisma migrate dev
nestack db:seed                          Shortcut for prisma db seed
```

## Generated stack

- NestJS
- Prisma + `@prisma/adapter-pg` (driver adapter, no engine binary)
- PostgreSQL
- Zod (validation)
- Swagger (docs)
- Vitest (tests)
- bcryptjs (hashing)
- Optional JWT RS256

## Maintainer publishing

Releases are tag-based. GitHub Actions uses **Trusted Publishing (OIDC)** with
**staged publishing** (`.github/workflows/publish.yml`): CI sends the version to the
staging queue and a maintainer approves it with 2FA before it becomes available.

```bash
npm version patch   # or minor/major (creates the commit and the tag)
git push --follow-tags
```

Pushing a `v*` tag triggers the workflow, which sends the version to the queue using
OIDC (no token, with provenance). To release it:

- npmjs.com → **Packages → nestack → Versions** (staged entry), or
- `npm stage approve <version>`

One-time prerequisites:

1. Publish the first version manually (`npm publish`, requires 2FA on the npm account
   that owns the package — today `milagrestobjr`).
2. On npmjs.com → **Package → Settings → Trusted Publisher** → GitHub Actions, fill in:
   - Organization/user: `milagresjr`
   - Repository: `nestack`
   - Workflow filename: `publish.yml`
   - Allowed actions: `npm stage publish` (already selected; enable `npm publish`
     only if you want direct publishing without approval)

CLI equivalent (after the first publish):

```bash
npm trust github nestack --file publish.yml --repo milagresjr/nestack --allow-stage-publish
```

## License

[MIT](./LICENSE) © Milagres Marques Luís Bartolomeu
