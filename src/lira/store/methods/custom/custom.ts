import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraMessageOutput } from '@lira/message/output/types'
import { LiraError } from '@lira/commons/utils/errors'
import { PACKAGE_ENDPOINT } from '@endpoints'
import { LiraInstanceParams } from '@lira/index'
import { LiraMessageInput } from '@lira/message/input/types'
import { LiraMessageInputStore } from '../../../..'

export class StoreCustom {
  constructor(
    private readonly store: LiraInstanceParams['store'],
    private readonly liraAPIKey?: string
  ) {}

  async message({
    input,
    output,
    error,
    reqTime,
  }: {
    input: Omit<LiraMessageInputStore, 'lira'> & {
      lira: Omit<LiraMessageInput.LiraMetadata, 'endUser'> & {
        endUser?: Omit<
          LiraMessageInput.LiraMetadataEndUser,
          'passIdToUnderlyingLLM'
        >
      }
    }
    reqTime?: LiraMessageOutput.RequestTime
    output?: Omit<LiraMessageOutput.Stream.Response, 'openai_options'>
    error?: unknown
  }): Promise<void> {
    try {
      const data = {
        input,
        output,
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
