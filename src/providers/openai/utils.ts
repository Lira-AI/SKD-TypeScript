import { OPENAI_MODELS } from '@lira/messages/commons/constants'
import { LiraMessageInput } from '@lira/messages/input/types'

export function isOpenAIModel(model: string): boolean {
  return Object.values(OPENAI_MODELS).includes(
    model as LiraMessageInput.OpenAIModels
  )
}
