import { ANTHROPIC_MODELS } from '@lira/messages/commons/constants'
import { LiraMessageInput } from '@lira/messages/input/types'

export function isAnthropicModel(model: string): boolean {
  return Object.values(ANTHROPIC_MODELS).includes(
    model as LiraMessageInput.AnthropicModels
  )
}
