import { PACKAGE_ENDPOINT } from '@endpoints'
import { LiraError } from '@lira/commons/utils/errors'
import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraInstanceParams } from '@lira/index'
import { LiraMessageOutput } from '@lira/message/output/types'
import { LiraMessageInputStore } from '../../..'
import { formatOutputStreamToStore } from './formatters'

export async function storeMessage({
  input,
  output,
  error,
  reqTime,
  store,
  liraAPIKey,
}: {
  input: LiraMessageInputStore
  reqTime?: LiraMessageOutput.RequestTime
  output?:
    | LiraMessageOutput.Static.Response
    | AsyncIterable<LiraMessageOutput.Stream.Response>
  error?: unknown
  store?: LiraInstanceParams['store']
  liraAPIKey?: string
}): Promise<void> {
  try {
    const formattedOutput = input.stream
      ? await formatOutputStreamToStore(
          output as AsyncIterable<LiraMessageOutput.Stream.Response>
        )
      : (output as LiraMessageOutput.Static.Response)

    const data = {
      input,
      output: formattedOutput,
      reqTime,
      error,
    }

    if (store?.callback) {
      try {
        await store?.callback(data)

        LiraLogger.debug(`Message stored successfully with callback.`)

        return
      } catch (error) {
        throw new LiraError(
          `Calling store callback ${store?.callback.name} failed:\n`,
          JSON.stringify(error, null, 2)
        )
      }
    }

    if (!liraAPIKey) {
      throw new LiraError(
        `Lira API key is required to store messages to Lira endpoint. Current key is ${liraAPIKey}`
      )
    }

    try {
      await PACKAGE_ENDPOINT.STORE_MESSAGE(liraAPIKey, data)

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
