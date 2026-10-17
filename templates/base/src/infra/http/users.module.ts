import { Module } from '@nestjs/common'
import { CreateUserUseCase } from '@/domain/forum/application/use-cases/create-user'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { CreateUserController } from './controllers/create-user.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [CreateUserController],
  providers: [CreateUserUseCase],
})
export class UsersModule {}
