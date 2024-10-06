import { LiraCommons } from '../../../commons/types'
import { LiraMessageOutput } from '../types'

export type StreamConverter<T> = {
  asyncIterable: AsyncIterable<T>
  converterFunction: ConverterFunction<T>
  bufferingStrategy?: BufferingStrategy<T>
  filterFunction?: FilterFunction<T>
  loggerMode?: LiraCommons.Logger
}

export type StreamContext = Record<string, unknown> | undefined

export type ConverterFunction<T> = (args: {
  output: T
  context: StreamContext
}) => { result: LiraMessageOutput.Stream.Response; context?: StreamContext }

export type BufferingBeweenFunction<T> = (args: {
  item: T
  context: StreamContext
  itemsToBeAggregated?: Array<T>
}) => boolean

export type AggregateFunction<T> = (args: {
  itemsToBeAggregated: Array<T>
}) => { result: LiraMessageOutput.Stream.Response; context?: StreamContext }

/**
 * @returns An aggregated item of all the items that match the strategy
 */
export type BufferingStrategy<T> = {
  /**
   * Start aggregating when the start function returns true (inclusive)
   * End aggregating when the end function returns true and yield the itemsToBeAggregated items (inclusive of the end item)
   */
  between: {
    start: BufferingBeweenFunction<T>
    end: BufferingBeweenFunction<T>
  }
  aggregateFunction: AggregateFunction<T>
}

/**
 * @returns True if the item should be filtered out
 */
export type FilterFunction<T> = (args: { item: T; context: StreamContext }) => {
  result: boolean
  context?: StreamContext
}
