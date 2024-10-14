import { LiraMessageOutput } from '../types'
import { StreamConverter } from './types'
import { streamIteratorConverter } from './utils/converter'

export function convertStream<T>({
  asyncIterable,
  converterFunction,
  bufferingStrategy,
  filterFunction,
}: StreamConverter<T>): {
  asyncIterable: AsyncIterable<LiraMessageOutput.Stream.Response>
} {
  const asyncIterableOutput = {
    [Symbol.asyncIterator]() {
      return streamIteratorConverter({
        asyncIterable,
        converterFunction,
        bufferingStrategy,
        filterFunction,
      })
    },
  }

  return {
    asyncIterable: asyncIterableOutput,
  }
}
