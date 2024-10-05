import { LiraMessageOutput } from '@lira/messages/output/types'
import { Lira, LiraInstanceParams } from '..'
import { LiraError } from '@lira/commons/utils/errors'
import { formatMessageStreamToStore } from '@lira/store/message/formatters'
import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraMessageInputStore } from '../..'
import { PACKAGE_ENDPOINT } from '@endpoints'
import { StoreAnthropic } from '@providers/anthropic/store/store'
import { StoreOpenAI } from '@providers/openai/store/store'

export class Store {
  public anthropic: StoreAnthropic

  public openai: StoreOpenAI

  constructor(
    private readonly lira: Lira,
    private readonly store: LiraInstanceParams['store'],
    private readonly liraAPIKey?: string
  ) {
    this.anthropic = new StoreAnthropic(this.lira)
    this.openai = new StoreOpenAI(this.lira)
  }

  async message({
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
  }): Promise<void> {
    try {
      const formattedOutput = input.stream
        ? await formatMessageStreamToStore(
            output as AsyncIterable<LiraMessageOutput.Stream.Response>
          )
        : (output as LiraMessageOutput.Static.Response)

      const data = {
        input,
        output: formattedOutput,
        reqTime,
        error,
      }

      if (this.store?.callback) {
        try {
          await this.store?.callback(data)

          LiraLogger.debug(`Message stored successfully with callback.`)

          return
        } catch (error) {
          throw new LiraError(
            `Calling store callback ${this.store?.callback.name} failed:\n`,
            JSON.stringify(error, null, 2)
          )
        }
      }

      if (!this.liraAPIKey) {
        throw new LiraError(
          `Lira API key is required to store messages to Lira endpoint. Current key is ${this.liraAPIKey}`
        )
      }

      try {
        await PACKAGE_ENDPOINT.STORE_MESSAGE(this.liraAPIKey, data)

        LiraLogger.debug(`Message stored successfully to Lira endpoint.`)

        return
      } catch (error) {
        throw new LiraError(
          `Lira endpoint failed:\n`,
          JSON.stringify(error, null, 2)
        )
      }
    } catch (error) {
      LiraLogger.error(`Error while storing message.`, error)
    }
  }
}
