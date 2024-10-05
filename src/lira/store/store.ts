import { LiraMessageOutput } from '@lira/messages/output/types'
import { Lira, LiraInstanceParams } from '..'
import { LiraError } from '@lira/commons/utils/errors'
import { formatMessageStreamToStore } from '@lira/store/message/formatters'
import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraMessageInputStore } from '../..'
import { Providers } from './providers/providers'

export class Store {
  public providers: Providers

  constructor(
    private readonly lira: Lira,
    private readonly store: LiraInstanceParams['store']
  ) {
    this.providers = new Providers(this.lira)
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
        ? await formatMessageStreamToStore(
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
