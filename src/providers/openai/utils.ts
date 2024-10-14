import { OPENAI_MODELS } from '@lira/message/commons/constants'
import { LiraMessageInput } from '@lira/message/input/types'

export function isOpenAIModel(model: string): boolean {
  return Object.values(OPENAI_MODELS).includes(
    model as LiraMessageInput.OpenAIModels
  )
}
