import {
  Message,
  RawMessageStreamEvent,
} from '@anthropic-ai/sdk/resources/messages'
import { Stream } from '@anthropic-ai/sdk/streaming'
import { LiraStore } from '@lira/store/types'
import {
  AnthropicMessageInput,
  chatInputAntrhopicToLira,
} from '@providers/anthropic/chat/input/converters/anthropic-to-lira'
import { chatOutputAnthropicToLira } from '@providers/anthropic/chat/output/converters/anthropic-to-lira'
import { LiraInstanceParams } from '@lira/index'
import { storeMessage } from '@lira/store/utils/store'

export class StoreAnthropic {
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
    input: AnthropicMessageInput
    output?: Stream<RawMessageStreamEvent> | Message
    reqTime?: LiraStore.ReqTimesStore
    error?: unknown
  }) {
    const formattedInput = chatInputAntrhopicToLira(input)

    const formattedOutput = output
      ? chatOutputAnthropicToLira({
          isStream: input.stream,
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
