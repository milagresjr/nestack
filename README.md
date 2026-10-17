# nestack

[![npm version](https://img.shields.io/npm/v/nestack.svg)](https://www.npmjs.com/package/nestack)
[![license](https://img.shields.io/npm/l/nestack.svg)](./LICENSE)

CLI para criar e evoluir projetos NestJS com DDD e Prisma.

Gera um projeto NestJS já estruturado com arquitetura em camadas (domain / infra),
Prisma com driver adapter (`@prisma/adapter-pg`), validação com Zod, Swagger,
testes com Vitest e autenticação JWT opcional.

## Requisitos

- Node.js >= 18
- npm
- Docker (opcional, para subir o Postgres via `compose.yaml`)

## Instalação

Global:

```bash
npm install -g nestack
```

Ou use direto com `npx`:

```bash
npx nestack new meu-app
```

## Criar um projeto

```bash
nestack new meu-app          # perguntas interativas
nestack new meu-app --yes    # usa os padrões
```

Durante a criação o CLI pergunta se você quer:

- Postgres via Docker (`compose.yaml`) e qual porta
- Autenticação JWT (RS256)
- Storage de arquivos (Cloudflare R2 ou Backblaze B2)
- Cache com Redis

Depois de criar:

```bash
cd meu-app
docker compose up -d --wait
npx prisma migrate dev --name init
npm run start:dev
```

A API sobe em `http://localhost:3333` e o Swagger em `http://localhost:3333/docs`.

## Gerar código

```bash
nestack make:<tipo> <nome> [-m <modulo>]
```

Tipos disponíveis:

| Tipo         | Descrição                                        |
| ------------ | ------------------------------------------------ |
| `entity`     | Entidade de domínio                              |
| `repository` | Contrato de repositório                          |
| `use-case`   | Caso de uso                                      |
| `controller` | Controller HTTP                                  |
| `module`     | Módulo Nest                                      |
| `dto`        | DTO (schema Zod)                                 |
| `presenter`  | Presenter HTTP                                   |
| `event`      | Evento de domínio                                |
| `resource`   | Conjunto completo (entity, repo, use-case, etc.) |

Exemplos:

```bash
nestack make:entity user -m forum
nestack make:use-case create-user -m forum
nestack make:controller create-user -m forum
nestack make:resource user -m forum
```

## Comandos

```bash
nestack new <nome> [--yes]               Cria um projeto Nest
nestack make:<tipo> <nome> [--module=x]  Gera arquivo(s) com código base
nestack migrate [nome]                   Atalho para prisma migrate dev
nestack db:seed                          Atalho para prisma db seed
```

## Stack gerada

- NestJS
- Prisma + `@prisma/adapter-pg` (driver adapter, sem binário de engine)
- PostgreSQL
- Zod (validação)
- Swagger (documentação)
- Vitest (testes)
- bcryptjs (hash)
- JWT RS256 opcional

## Licença

[MIT](./LICENSE) © Milagres Marques Luís Bartolomeu
