import { UseCaseError } from '@/core/errors/use-case-error'

export class UserAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('E-mail já cadastrado.')
  }
}
