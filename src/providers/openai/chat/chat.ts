import OpenAI from 'openai'
import type { Stream } from 'openai/streaming'
import { chatInputLiraToOpenAI } from './input/converters/lira-to-openai'
import { LiraProviders } from '../../types'
import { LiraLogger } from '@lira/commons/utils/logger'
import { convertStream } from '@lira/messages/output/stream'
import { LiraError } from '@lira/commons/utils/errors'
import { streamOutputConverter } from './output/converters/openai-to-lira/stream'
import { staticOutputConverter } from './output/converters/openai-to-lira/static'

export const openAIChat: LiraProviders.Chat = async (openAIKey, input) => {
  const openaiFormattedInput = chatInputLiraToOpenAI(input)

  LiraLogger.debug('OpenAI Input', openaiFormattedInput)

  const start = Date.now()

  let openai: OpenAI
  try {
    const openaiSDK = (await import('openai')).default
    openai = new openaiSDK({ apiKey: openAIKey })
  } catch (err) {
    throw new LiraError(
      'The OpenAI SDK could not be loaded. Did you run `npm install openai`?'
    )
  }

  const res = await openai.chat.completions.create(openaiFormattedInput)

  const end = Date.now()

  if (input.stream) {
    const { asyncIterable } = convertStream({
      asyncIterable: res as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
      converterFunction: streamOutputConverter,
    })

    return { res: asyncIterable, reqTimes: { start, end } }
  }

  const staticRes = res as OpenAI.Chat.Completions.ChatCompletion

  LiraLogger.debug('OpenAI Output', staticRes)

  const formattedStaticRes = staticOutputConverter(staticRes)

  return { res: formattedStaticRes, reqTime: { start, end } }
}
