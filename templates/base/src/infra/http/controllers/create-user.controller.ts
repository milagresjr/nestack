import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreateUserUseCase } from '@/domain/forum/application/use-cases/create-user'
import { Public } from '../../auth/public'
import { createUserBodySchema } from '../dtos/create-user.dto'
import type { CreateUserBody } from '../dtos/create-user.dto'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { UserPresenter } from '../presenters/user-presenter'

@ApiTags('users')
@Controller('/users')
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post()
  @Public()
  @HttpCode(201)
  async handle(
    @Body(new ZodValidationPipe(createUserBodySchema)) body: CreateUserBody,
  ) {
    const { name, email, password } = body

    const result = await this.createUser.execute({ name, email, password })

    if (result.isLeft()) {
      throw new ConflictException(result.value.message)
    }

    return { user: UserPresenter.toHTTP(result.value.user) }
  }
}
