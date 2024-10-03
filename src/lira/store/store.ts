import { LiraMessageInputStore } from '@lira/messages/input/store/types'
import { LiraMessageOutput } from '@lira/messages/output/types'
import { LiraInstanceParams } from '..'
import { LiraError } from '@lira/commons/utils/errors'
import { formatStreamToStore } from '@lira/messages/output/store/store'
import { LiraLogger } from '@lira/commons/utils/logger'

export class Store {
  constructor(private readonly store: LiraInstanceParams['store']) {}

  async create({
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
