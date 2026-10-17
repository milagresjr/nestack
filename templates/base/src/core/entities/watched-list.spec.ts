import { WatchedList } from './watched-list'

class NumberWatchedList extends WatchedList<number> {
  compareItems(a: number, b: number): boolean {
    return a === b
  }
}

describe('watched list', () => {
  it('should be able to create a watched list with initial items', () => {
    const list = new NumberWatchedList([1, 2, 3])

    expect(list.getNewItems()).toEqual([])
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getItems()).toEqual([1, 2, 3])
  })

  it('should be able to add new items to the list', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.add(4)

    expect(list.getNewItems()).toEqual([4])
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getItems()).toEqual([1, 2, 3, 4])
  })

  it('should be able to remove items from the list', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.remove(2)

    expect(list.getNewItems()).toEqual([])
    expect(list.getRemovedItems()).toEqual([2])
    expect(list.getItems()).toEqual([1, 3])
  })

  it('should not add an item twice', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.add(2)

    expect(list.getNewItems()).toEqual([])
    expect(list.getItems()).toEqual([1, 2, 3])
  })

  it('should not remove an item that does not exist', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.remove(4)

    expect(list.getRemovedItems()).toEqual([])
    expect(list.getItems()).toEqual([1, 2, 3])
  })

  it('should be able to add an item that was removed', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.remove(2)
    list.add(2)

    expect(list.getNewItems()).toEqual([])
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getItems()).toEqual([1, 2, 3])
  })

  it('should be able to remove an item that was added', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.add(4)
    list.remove(4)

    expect(list.getNewItems()).toEqual([])
    expect(list.getRemovedItems()).toEqual([])
    expect(list.getItems()).toEqual([1, 2, 3])
  })

  it('should be able to update the list', () => {
    const list = new NumberWatchedList([1, 2, 3])

    list.update([1, 3, 5])

    expect(list.getNewItems()).toEqual([5])
    expect(list.getRemovedItems()).toEqual([2])
    expect(list.getUpdatedItems()).toEqual([])
    expect(list.getItems()).toEqual([1, 3, 5])
  })
})
