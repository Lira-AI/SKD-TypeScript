import { isAnthropicModel } from '@providers/anthropic/utils'
import { anthropicChat } from '@providers/anthropic/chat/chat'
import { openAIChat } from '@providers/openai/chat/chat'
import { isOpenAIModel } from '@providers/openai/utils'
import { LiraError } from '@lira/commons/utils/errors'
import { LiraMessageInput } from './input/types'
import { tee } from './output/stream/utils/tee'
import { LiraMessageOutput } from './output/types'
import { Lira, LiraInstanceParams } from '..'
import { LiraStore } from '@lira/store/types'

export class Message {
  constructor(
    private readonly lira: Lira,
    private readonly keys: LiraInstanceParams['keys'],
    private readonly store: LiraInstanceParams['store']
  ) {}

  async create(
    input: LiraMessageInput.Params & { stream: true }
  ): Promise<AsyncIterable<LiraMessageOutput.Stream.Response>>

  async create(
    input: LiraMessageInput.Params & { stream?: false }
  ): Promise<LiraMessageOutput.Static.Response>

  async create(
    input: LiraMessageInput.Params
  ): Promise<
    | LiraMessageOutput.Static.Response
    | AsyncIterable<LiraMessageOutput.Stream.Response>
  > {
    let formattedInput: LiraStore.InputStore = input

    const isToStore = input.lira?.store?.enabled ?? this.store?.enabled

    try {
      if (isAnthropicModel(input.model)) {
        if (!this.keys.anthropic) {
          throw new LiraError(
            'Anthropic key is required if selceted as provider'
          )
        }

        formattedInput = {
          ...input,
          provider: 'Anthropic',
        }

        const { res: llmRes, reqTime } = await anthropicChat(
          this.keys.anthropic,
          formattedInput
        )

        let outputRes:
          | LiraMessageOutput.Static.Response
          | AsyncIterable<LiraMessageOutput.Stream.Response>

        let resToStore:
          | LiraMessageOutput.Static.Response
          | AsyncIterable<LiraMessageOutput.Stream.Response>
          | undefined

        if (input.stream) {
          ;[outputRes, resToStore] = tee(
            llmRes as AsyncIterable<LiraMessageOutput.Stream.Response>
          )
        } else {
          outputRes = llmRes
          resToStore = llmRes
        }

        if (isToStore) {
          // not await to avoid blocking the main thread
          this.lira.store.message({
            input: formattedInput,
            output: resToStore,
            reqTime,
          })
        }

        return outputRes
      }

      if (isOpenAIModel(input.model)) {
        if (!this.keys.openAI) {
          throw new LiraError('OpenAI key is required if selected as provider')
        }

        formattedInput = {
          ...input,
          provider: 'OpenAI',
        }

        const { res: llmRes, reqTime } = await openAIChat(
          this.keys.openAI,
          input
        )

        let outputRes:
          | LiraMessageOutput.Static.Response
          | AsyncIterable<LiraMessageOutput.Stream.Response>

        let resToStore:
          | LiraMessageOutput.Static.Response
          | AsyncIterable<LiraMessageOutput.Stream.Response>
          | undefined

        if (input.stream) {
          ;[outputRes, resToStore] = tee(
            llmRes as AsyncIterable<LiraMessageOutput.Stream.Response>
          )
        } else {
          outputRes = llmRes
          resToStore = llmRes
        }

        if (isToStore) {
          // not await to avoid blocking the main thread
          this.lira.store.message({
            input: formattedInput,
            output: resToStore,
            reqTime,
          })
        }

        return outputRes
      }

      throw new LiraError('Model not supported')
    } catch (error) {
      if (isToStore) {
        // not await to avoid blocking the main thread
        this.lira.store.message({
          input: formattedInput,
          error,
        })
      }

      throw error
    }
  }
}
