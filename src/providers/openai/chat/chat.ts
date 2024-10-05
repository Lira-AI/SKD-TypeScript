import OpenAI from 'openai'
import { chatInputLiraToOpenAI } from './input/converters/lira-to-openai'
import { LiraProviders } from '../../types'
import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraError } from '@lira/commons/utils/errors'
import { chatOutputOpenAIToLira } from './output/converters/openai-to-lira'

export const openAIChat: LiraProviders.Chat = async (openAIKey, input) => {
  const openaiFormattedInput = chatInputLiraToOpenAI(input)

  LiraLogger.debug('OpenAI Input', openaiFormattedInput)

  const start = Date.now()

  let openai: OpenAI
  try {
    const openaiSDK = (await import('openai')).default
    openai = new openaiSDK({ apiKey: openAIKey })
  } catch (err) {
    throw new LiraError(
      'The OpenAI SDK could not be loaded. Did you run `npm install openai`?'
    )
  }

  const res = await openai.chat.completions.create(openaiFormattedInput)

  const end = Date.now()

  const formattedOutput = chatOutputOpenAIToLira({
    isStream: input.stream,
    output: res,
  })

  return { res: formattedOutput, reqTime: { start, end } }
}
