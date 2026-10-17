import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'

// Registre aqui os subscribers (ex.: OnAnswerCreated) para entrarem no DI.
@Module({
  imports: [DatabaseModule],
  providers: [],
})
export class EventsModule {}
