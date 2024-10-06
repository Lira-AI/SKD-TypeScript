import { Lira } from '@lira/index'
import { LiraStore } from '@lira/store/types'
import { chatInputOpenAIToLira } from '@providers/openai/chat/input/converters/openai-to-lira'
import { chatOutputOpenAIToLira } from '@providers/openai/chat/output/converters/openai-to-lira'
import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParams,
} from 'openai/resources'
import { Stream } from 'openai/streaming'

export class StoreOpenAI {
  constructor(private readonly lira: Lira) {}

  async message({
    input,
    output,
    reqTime,
    error,
  }: {
    input: ChatCompletionCreateParams
    output?: Stream<ChatCompletionChunk> | ChatCompletion
    reqTime?: LiraStore.ReqTimesStore
    error?: unknown
  }) {
    const formattedInput = chatInputOpenAIToLira(input)

    const formattedOutput = output
      ? chatOutputOpenAIToLira({
          isStream: input.stream ?? undefined,
          output,
        })
      : undefined

    return this.lira.store.message({
      input: formattedInput,
      output: formattedOutput,
      reqTime,
      error,
    })
  }
}
