import { Injectable } from '@nestjs/common'
import { UsersRepository } from '@/domain/forum/application/repositories/users-repository'
import { User } from '@/domain/forum/enterprise/entities/user'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      return null
    }

    return PrismaUserMapper.toDomain(user)
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) })
  }
}
