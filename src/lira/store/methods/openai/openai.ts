import { LiraInstanceParams } from '@lira/index'
import { LiraStore } from '@lira/store/types'
import { storeMessage } from '@lira/store/utils/store'
import {
  chatInputOpenAIToLira,
  OpenAIMessageInput,
} from '@providers/openai/chat/input/converters/openai-to-lira'
import { chatOutputOpenAIToLira } from '@providers/openai/chat/output/converters/openai-to-lira'
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources'
import { Stream } from 'openai/streaming'

export class StoreOpenAI {
  constructor(
    private readonly store: LiraInstanceParams['store'],
    private readonly liraAPIKey?: string
  ) {}

  async message({
    input,
    output,
    reqTime,
    error,
  }: {
    input: OpenAIMessageInput
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

    return storeMessage({
      input: formattedInput,
      output: formattedOutput,
      reqTime,
      error,
      store: this.store,
      liraAPIKey: this.liraAPIKey,
    })
  }
}
