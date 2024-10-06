export function tee<T>(
  asyncIterable: AsyncIterable<T>
): [AsyncIterable<T>, AsyncIterable<T>] {
  const left: Array<Promise<IteratorResult<T>>> = []
  const right: Array<Promise<IteratorResult<T>>> = []
  const iterator = asyncIterable[Symbol.asyncIterator]()

  const teeIterator = (
    queue: Array<Promise<IteratorResult<T>>>
  ): AsyncIterator<T> => {
    return {
      next: () => {
        if (queue.length === 0) {
          const result = iterator.next()
          left.push(result)
          right.push(result)
        }
        return queue.shift()!
      },
    }
  }

  return [
    {
      [Symbol.asyncIterator]: () => teeIterator(left),
    },
    {
      [Symbol.asyncIterator]: () => teeIterator(right),
    },
  ]
}
