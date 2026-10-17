import { DomainEvent } from '@/core/events/domain-event'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class {{Pascal}}Event implements DomainEvent {
  public ocurredAt: Date

  constructor(/* public entity: Entity */) {
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    throw new Error('Not implemented')
  }
}
