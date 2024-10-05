import {
  Message,
  MessageCreateParamsBase,
  RawMessageStreamEvent,
} from '@anthropic-ai/sdk/resources/messages'
import { Stream } from '@anthropic-ai/sdk/streaming'
import { Lira } from '@lira/index'
import { LiraStore } from '@lira/store/types'
import { chatInputAntrhopicToLira } from '@providers/anthropic/chat/input/converters/anthropic-to-lira'
import { chatOutputAnthropicToLira } from '@providers/anthropic/chat/output/converters/anthropic-to-lira'

export class StoreAnthropic {
  constructor(private readonly lira: Lira) {}

  async message({
    input,
    output,
    reqTime,
    error,
  }: {
    input: MessageCreateParamsBase
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

    return this.lira.store.message({
      input: formattedInput,
      output: formattedOutput,
      reqTime,
      error,
    })
  }
}
