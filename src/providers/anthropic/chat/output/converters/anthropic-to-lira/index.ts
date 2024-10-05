import { Message, RawMessageStreamEvent } from '@anthropic-ai/sdk/resources'
import { Stream } from '@anthropic-ai/sdk/streaming'
import { convertStream } from '@lira/messages/output/stream'
import { streamOutputConverter } from './stream'
import { aggregator, endBuffering, startBuffering } from '../../utils/buffer'
import { filterMessageStopType } from '../../utils/filter'
import { LiraLogger } from '@lira/commons/utils/logger'
import { staticOutputConverter } from './static'

export function chatOutputAnthropicToLira({
  isStream = false,
  output,
}: {
  isStream?: boolean
  output: Stream<RawMessageStreamEvent> | Message
}) {
  if (isStream) {
    const { asyncIterable } = convertStream({
      asyncIterable: output as Stream<RawMessageStreamEvent>,
      converterFunction: streamOutputConverter,
      bufferingStrategy: {
        between: {
          start: startBuffering,
          end: endBuffering,
        },
        aggregateFunction: aggregator,
      },
      filterFunction: filterMessageStopType,
    })

    return asyncIterable
  }

  const staticRes = output as Message

  LiraLogger.debug('Anthropic Output', staticRes)

  return staticOutputConverter(staticRes)
}
