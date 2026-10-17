import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { UsersModule } from './users.module'

// Registre aqui controllers e use cases (ou importe módulos gerados com make:module).
@Module({
  imports: [DatabaseModule, CryptographyModule, UsersModule],
  controllers: [],
  providers: [],
})
export class HttpModule {}
