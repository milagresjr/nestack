export abstract class WatchedList<T> {
  public currentItems: T[]
  private initial: T[]
  private new: T[]
  private removed: T[]
  private updated: T[]

  constructor(initialItems?: T[]) {
    this.currentItems = initialItems || []
    this.initial = initialItems || []
    this.new = []
    this.removed = []
    this.updated = []
  }

  abstract compareItems(a: T, b: T): boolean

  public getItems() { return this.currentItems }
  public getNewItems() { return this.new }
  public getRemovedItems() { return this.removed }
  public getUpdatedItems() { return this.updated }

  private isCurrentItem(item: T) { return this.currentItems.some((v) => this.compareItems(item, v)) }
  private isNewItem(item: T) { return this.new.some((v) => this.compareItems(item, v)) }
  private isRemovedItem(item: T) { return this.removed.some((v) => this.compareItems(item, v)) }
  private wasAddedInitially(item: T) { return this.initial.some((v) => this.compareItems(item, v)) }

  private removeFromNew(item: T) { this.new = this.new.filter((v) => !this.compareItems(v, item)) }
  private removeFromCurrent(item: T) { this.currentItems = this.currentItems.filter((v) => !this.compareItems(item, v)) }
  private removeFromRemoved(item: T) { this.removed = this.removed.filter((v) => !this.compareItems(item, v)) }

  public exists(item: T) { return this.isCurrentItem(item) }

  public add(item: T) {
    if (this.isRemovedItem(item)) this.removeFromRemoved(item)
    if (!this.isNewItem(item) && !this.wasAddedInitially(item)) this.new.push(item)
    if (!this.isCurrentItem(item)) this.currentItems.push(item)
  }

  public remove(item: T) {
    this.removeFromCurrent(item)
    if (this.isNewItem(item)) { this.removeFromNew(item); return }
    if (!this.isRemovedItem(item)) this.removed.push(item)
  }

  public update(items: T[]) {
    this.new = items.filter((a) => !this.getItems().some((b) => this.compareItems(a, b)))
    this.removed = this.getItems().filter((a) => !items.some((b) => this.compareItems(a, b)))
    this.updated = items.filter((a) => !this.new.includes(a) && !this.removed.includes(a) && !this.initial.some((b) => this.compareItems(a, b)))
    this.currentItems = items
  }
}
