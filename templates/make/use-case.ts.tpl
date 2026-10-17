import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/either'

interface {{Pascal}}UseCaseRequest {
  // TODO: dados de entrada
}

type {{Pascal}}UseCaseResponse = Either<null, {
  // TODO: dados de saída
}>

@Injectable()
export class {{Pascal}}UseCase {
  constructor() {}

  async execute(request: {{Pascal}}UseCaseRequest): Promise<{{Pascal}}UseCaseResponse> {
    return right({})
  }
}
