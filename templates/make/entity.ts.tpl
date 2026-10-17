import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface {{Pascal}}Props {
  createdAt: Date
  updatedAt?: Date | null
}

export class {{Pascal}} extends Entity<{{Pascal}}Props> {
  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(props: Optional<{{Pascal}}Props, 'createdAt'>, id?: UniqueEntityID) {
    return new {{Pascal}}({ ...props, createdAt: props.createdAt ?? new Date() }, id)
  }
}
