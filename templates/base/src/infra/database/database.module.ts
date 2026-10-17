import { Module } from '@nestjs/common'
import { UsersRepository } from '@/domain/forum/application/repositories/users-repository'
import { PrismaModule } from './prisma/prisma.module'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'

// Registre aqui as implementações Prisma dos repositórios:
// { provide: QuestionRepository, useClass: PrismaQuestionsRepository }
@Module({
  imports: [PrismaModule],
  providers: [{ provide: UsersRepository, useClass: PrismaUsersRepository }],
  exports: [UsersRepository],
})
export class DatabaseModule {}
