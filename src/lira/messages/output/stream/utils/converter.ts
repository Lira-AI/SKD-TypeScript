import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraMessageOutput } from '../../types'
import { FilterFunction, StreamContext, StreamConverter } from '../types'
import { handleBufferingStrategy } from './buffering'
import { LiraError } from '@lira/commons/utils/errors'

export async function* streamIteratorConverter<T>({
  asyncIterable,
  converterFunction,
  bufferingStrategy,
  filterFunction,
}: StreamConverter<T>): AsyncIterator<LiraMessageOutput.Stream.Response> {
  try {
    const itemsToBuffer: Array<T> = []
    let context: StreamContext = {}

    for await (const result of asyncIterable) {
      LiraLogger.debug(
        'Stream Provider Output',
        JSON.stringify(result, null, 2)
      )

      const filter: ReturnType<FilterFunction<T>> | undefined =
        filterFunction && filterFunction({ item: result, context })

      context = filter?.context ? { ...context, ...filter?.context } : context

      if (!filter?.result) {
        const { data, type } = handleBufferingStrategy({
          itemsToBuffer,
          context,
          bufferingStrategy,
          currentValue: result,
        })

        if (type === 'none') {
          const { result: converterRes, context: newContext } =
            converterFunction({
              output: result,
              context,
            })

          context = newContext ? { ...context, ...newContext } : context

          yield converterRes
        } else if (type === 'buffer') {
          itemsToBuffer.push(data)
        } else if (type === 'aggregate' && bufferingStrategy) {
          const { result: aggregatedItem, context: newContext } =
            bufferingStrategy.aggregateFunction({
              itemsToBeAggregated: [...itemsToBuffer, data],
            })

          context = newContext ? { ...context, ...newContext } : context

          itemsToBuffer.length = 0

          yield aggregatedItem
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e instanceof Error && e.name === 'AbortError') return
    throw new LiraError(`Error in converterStreamIterator: ${e.message}`)
  }
}
