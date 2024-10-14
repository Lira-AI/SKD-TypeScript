import { BufferingStrategy, StreamContext } from '../types'

export function handleBufferingStrategy<T>({
  itemsToBuffer,
  context,
  bufferingStrategy,
  currentValue,
}: {
  itemsToBuffer: Array<T>
  context: StreamContext
  bufferingStrategy?: BufferingStrategy<T>
  currentValue: T
}): { data: T; type: 'buffer' | 'aggregate' | 'none' } {
  if (bufferingStrategy?.between) {
    if (
      bufferingStrategy?.between.start({
        item: currentValue,
        context,
        itemsToBeAggregated: itemsToBuffer,
      })
    ) {
      return { data: currentValue, type: 'buffer' }
    }

    if (
      bufferingStrategy?.between.end({
        item: currentValue,
        context,
        itemsToBeAggregated: itemsToBuffer,
      })
    ) {
      return { data: currentValue, type: 'aggregate' }
    }
  }
  return { data: currentValue, type: 'none' }
}
