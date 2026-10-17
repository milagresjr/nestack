import { {{Pascal}} } from '../../enterprise/entities/{{kebab}}'

export abstract class {{Pascal}}Repository {
  abstract findById(id: string): Promise<{{Pascal}} | null>
  abstract create({{camel}}: {{Pascal}}): Promise<void>
  abstract save({{camel}}: {{Pascal}}): Promise<void>
  abstract delete({{camel}}: {{Pascal}}): Promise<void>
}
