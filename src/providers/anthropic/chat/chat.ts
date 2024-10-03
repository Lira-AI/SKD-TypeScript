import Anthropic from '@anthropic-ai/sdk'
import { Message, RawMessageStreamEvent } from '@anthropic-ai/sdk/resources'
import { Stream } from '@anthropic-ai/sdk/streaming'
import { chatInputLiraToAntrhopic } from './input/converters/liraToAnthropic'
import { streamOutputConverter } from './output/converters/stream'
import { aggregator, endBuffering, startBuffering } from './output/utils/buffer'
import { filterMessageStopType } from './output/utils/filter'
import { staticOutputConverter } from './output/converters/static'
import { LiraProviders } from '../../types'
import { LiraLogger } from '@lira/commons/utils/logger'
import { convertStream } from '@lira/messages/output/stream'
import { LiraError } from '@lira/commons/utils/errors'

export const anthropicChat: LiraProviders.Chat = async (
  anthropicApiKey,
  input
) => {
  const formattedInput = chatInputLiraToAntrhopic(input)

  LiraLogger.debug('Anthropic Input', formattedInput)

  const start = Date.now()

  let anthropic: Anthropic
  try {
    const anthropicSDK = (await import('@anthropic-ai/sdk')).default
    anthropic = new anthropicSDK({ apiKey: anthropicApiKey })
  } catch (err) {
    throw new LiraError(
      'The Anthropic SDK could not be loaded. Did you run `npm install @anthropic-ai/sdk`?'
    )
  }

  const res = await anthropic.messages.create(formattedInput)

  const end = Date.now()

  if (input.stream) {
    const { asyncIterable } = convertStream({
      asyncIterable: res as Stream<RawMessageStreamEvent>,
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

    return { res: asyncIterable, reqTimes: { start, end } }
  }

  const staticRes = res as Message

  LiraLogger.debug('Anthropic Output', staticRes)

  const formattedStaticRes = staticOutputConverter(staticRes)

  return { res: formattedStaticRes, reqTime: { start, end } }
}
