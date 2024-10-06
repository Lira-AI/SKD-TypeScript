import { LiraProviders } from '@providers/types'
import { LiraMessageOutput } from '@lira/message/output/types'
import { LiraMessageInput } from '@lira/message/input/types'

export namespace LiraStore {
  export type Callback = (data: MessageObj) => Promise<void> | void

  export type MessageObj = {
    input: InputStore
    output?: OutputStore
    reqTime?: ReqTimesStore
    error?: unknown
  }

  export type InputStore = LiraMessageInput.Params & {
    provider?: LiraProviders.Providers
  }

  export type OutputStore = LiraMessageOutput.Stream.Response
  export type ReqTimesStore = LiraMessageOutput.RequestTime
}
