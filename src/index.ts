import { LiraMessageInput as NS_LiraMessageInput } from '@lira/messages/input/types'
import { LiraMessageOutput as NS_LiraMessageOutput } from '@lira/messages/output/types'
import { LiraProviders as NS_LiraProviders } from '@providers/types'
import { LiraStore } from '@lira/store/types'

export { Lira } from '@lira/index'

export type LiraMessageInput = NS_LiraMessageInput.Params
export type LiraMessageOutput =
  | NS_LiraMessageOutput.Static.Response
  | NS_LiraMessageOutput.Stream.Response

export type LiraMessageInputStore = LiraStore.InputStore
export type LiraMessageOutputStore = LiraStore.OutputStore
export type LiraMessageReqTimesStore = LiraStore.ReqTimesStore
export type LiraMessageStore = LiraStore.MessageObj

export {
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  ROLES,
} from '@lira/messages/commons/constants'

export { isAnthropicModel } from '@providers/anthropic/utils'
export { isOpenAIModel } from '@providers/openai/utils'
export const providers = NS_LiraProviders.providers
export type LiraProviders = NS_LiraProviders.Providers
