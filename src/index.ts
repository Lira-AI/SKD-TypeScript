import { LiraMessageInput as NS_LiraMessageInput } from '@lira/messages/input/types'
import { LiraMessageOutput as NS_LiraMessageOutput } from '@lira/messages/output/types'
import { LiraProviders as NS_LiraProviders } from '@providers/types'
import { LiraMessage } from '@lira/messages/commons/types'

export { Lira } from '@lira/index'

export type LiraMessageInput = NS_LiraMessageInput.Params
export type LiraMessageOutput =
  | NS_LiraMessageOutput.Static.Response
  | NS_LiraMessageOutput.Stream.Response

export { LiraMessageInputStore } from '@lira/messages/input/store/types'
export { LiraMessageOutputStore } from '@lira/messages/output/store/types'
export { LiraMessageReqTimesStore } from '@lira/messages/output/store/types'
export type LiraMessageStore = LiraMessage.Store

export {
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  ROLES,
} from '@lira/messages/commons/constants'

export { isAnthropicModel } from '@providers/anthropic/utils'
export { isOpenAIModel } from '@providers/openai/utils'
export const providers = NS_LiraProviders.providers
export type LiraProviders = NS_LiraProviders.Providers
