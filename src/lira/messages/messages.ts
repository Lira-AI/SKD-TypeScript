import { isAnthropicModel } from '@providers/anthropic/utils'
import { anthropicChat } from '@providers/anthropic/chat/chat'
import { openAIChat } from '@providers/openai/chat/chat'
import { isOpenAIModel } from '@providers/openai/utils'
import { LiraError } from '@lira/commons/utils/errors'
import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraMessageInput } from './input/types'
import { formatStreamToStore } from './output/store/store'
import { tee } from './output/stream/utils/tee'
import { LiraMessageOutput } from './output/types'
import { LiraMessageInputStore } from './input/store/types'
import { LiraInstanceParams } from '..'

export class Messages {
  constructor(
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
    let formattedInput: LiraMessageInputStore = input

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

        this.#store({
          input: formattedInput,
          output: resToStore,
          reqTime,
        })

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

        // not await to avoid blocking the main thread
        this.#store({
          input: formattedInput,
          output: resToStore,
          reqTime,
        })

        return outputRes
      }

      throw new LiraError('Model not supported')
    } catch (error) {
      // not await to avoid blocking the main thread
      this.#store({
        input: formattedInput,
        error,
      })

      throw error
    }
  }

  async #store({
    input,
    output,
    error,
    reqTime,
  }: {
    input: LiraMessageInputStore
    reqTime?: LiraMessageOutput.RequestTime
    output?:
      | LiraMessageOutput.Static.Response
      | AsyncIterable<LiraMessageOutput.Stream.Response>
    error?: unknown
  }) {
    if (!this.store?.enabled) {
      return
    }

    const storeCallback = this.store?.callback

    if (!storeCallback) {
      throw new LiraError('Store callback is required to store messages')
    }

    try {
      const formattedOutput = input.stream
        ? await formatStreamToStore(
            output as AsyncIterable<LiraMessageOutput.Stream.Response>
          )
        : (output as LiraMessageOutput.Static.Response)

      const data = {
        input,
        output: { ...formattedOutput },
        reqTime,
        error,
      }

      await storeCallback(data)
    } catch (error) {
      LiraLogger.error('Failed to store message', error)
    }
  }
}
