import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'
import { getDatabasePool, getDatabaseSchema } from './database.pool'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg(getDatabasePool(), {
      schema: getDatabaseSchema(),
      disposeExternalPool: true,
      onPoolError: (error) => {
        Logger.error(
          'Unexpected error on database pool',
          error.stack ?? '',
          PrismaService.name,
        )
      },
    })

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
