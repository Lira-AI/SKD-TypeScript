import { LiraProviders } from '@providers/types'
import { LiraMessageInput } from '../types'

export type LiraMessageInputStore = LiraMessageInput.Params & {
  provider?: LiraProviders.Providers
}
