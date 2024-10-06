import { ChatCompletion, ChatCompletionChunk } from 'openai/resources'
import { Stream } from 'openai/streaming'
import { streamOutputConverter } from './stream'
import { convertStream } from '@lira/message/output/stream'
import { LiraLogger } from '@lira/commons/utils/logger'
import { staticOutputConverter } from './static'

export function chatOutputOpenAIToLira({
  isStream,
  output,
}: {
  isStream?: boolean
  output: Stream<ChatCompletionChunk> | ChatCompletion
}) {
  if (isStream) {
    const { asyncIterable } = convertStream({
      asyncIterable: output as Stream<ChatCompletionChunk>,
      converterFunction: streamOutputConverter,
    })

    return asyncIterable
  }

  const staticRes = output as ChatCompletion

  LiraLogger.debug('OpenAI Output', staticRes)

  return staticOutputConverter(staticRes)
}
