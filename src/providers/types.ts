import { LiraMessageInput } from '@lira/message/input/types'
import { LiraMessageOutput } from '@lira/message/output/types'

export namespace LiraProviders {
  export const providers = ['anthropic', 'openai'] as const

  export type Providers = (typeof providers)[number] | string

  export type Chat = (
    providerApiKey: string,
    input: LiraMessageInput.Params
  ) => Promise<{
    res:
      | LiraMessageOutput.Static.Response
      | AsyncIterable<LiraMessageOutput.Stream.Response>
    reqTime?: LiraMessageOutput.RequestTime
  }>
}
