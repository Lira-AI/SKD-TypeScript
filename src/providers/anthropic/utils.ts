import { ANTHROPIC_MODELS } from '@lira/message/commons/constants'
import { LiraMessageInput } from '@lira/message/input/types'

export function isAnthropicModel(model: string): boolean {
  return Object.values(ANTHROPIC_MODELS).includes(
    model as LiraMessageInput.AnthropicModels
  )
}
