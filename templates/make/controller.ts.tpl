import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { {{camel}}BodySchema, {{Pascal}}Body } from '../dtos/{{kebab}}.dto'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

@ApiTags('{{module}}')
@Controller('/{{module}}')
export class {{Pascal}}Controller {
  constructor() {}

  @Post()
  @HttpCode(201)
  async handle(@Body(new ZodValidationPipe({{camel}}BodySchema)) body: {{Pascal}}Body) {
    // TODO: chamar o use case
  }
}
