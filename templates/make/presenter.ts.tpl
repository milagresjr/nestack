import { {{Pascal}} } from '@/domain/{{module}}/enterprise/entities/{{kebab}}'

export class {{Pascal}}Presenter {
  static toHTTP({{camel}}: {{Pascal}}) {
    return {
      id: {{camel}}.id.toString(),
      createdAt: {{camel}}.createdAt,
    }
  }
}
