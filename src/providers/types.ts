import { LiraMessageInput } from '@lira/messages/input/types'
import { LiraMessageOutput } from '@lira/messages/output/types'

export namespace LiraProviders {
  export const providers = ['Anthropic', 'OpenAI'] as const

  export type Providers = (typeof providers)[number]

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
