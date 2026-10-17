import { AggregateRoot } from '../entities/aggregate-root'
import { UniqueEntityID } from '../entities/unique-entity-id'
import { DomainEvent } from './domain-event'

type DomainEventCallback = (event: any) => void

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {}
  private static markedAggregates: AggregateRoot<unknown>[] = []

  public static shouldRun = true

  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>) {
    if (!this.findMarkedAggregateByID(aggregate.id)) this.markedAggregates.push(aggregate)
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>) {
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event))
  }

  private static removeAggregateFromMarkedDispatchList(aggregate: AggregateRoot<unknown>) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))
    this.markedAggregates.splice(index, 1)
  }

  private static findMarkedAggregateByID(id: UniqueEntityID) {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id))
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID) {
    const aggregate = this.findMarkedAggregateByID(id)
    if (aggregate) {
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearEvents()
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  public static register(callback: DomainEventCallback, eventClassName: string) {
    if (!(eventClassName in this.handlersMap)) this.handlersMap[eventClassName] = []
    this.handlersMap[eventClassName].push(callback)
  }

  public static clearHandlers() { this.handlersMap = {} }
  public static clearMarkedAggregates() { this.markedAggregates = [] }

  private static dispatch(event: DomainEvent) {
    const eventClassName = event.constructor.name
    if (eventClassName in this.handlersMap && this.shouldRun) {
      this.handlersMap[eventClassName].forEach((handler) => handler(event))
    }
  }
}
