import Anthropic from '@anthropic-ai/sdk'
import { chatInputLiraToAntrhopic } from './input/converters/lira-to-anthropic'
import { LiraProviders } from '../../types'
import { LiraLogger } from '@lira/commons/utils/logger'
import { LiraError } from '@lira/commons/utils/errors'
import { chatOutputAnthropicToLira } from './output/converters/anthropic-to-lira'

export const anthropicChat: LiraProviders.Chat = async (
  anthropicApiKey,
  input
) => {
  const formattedInput = chatInputLiraToAntrhopic(input)

  LiraLogger.debug('Anthropic Input', formattedInput)

  const start = Date.now()

  let anthropic: Anthropic
  try {
    const anthropicSDK = (await import('@anthropic-ai/sdk')).default
    anthropic = new anthropicSDK({ apiKey: anthropicApiKey })
  } catch (err) {
    throw new LiraError(
      'The Anthropic SDK could not be loaded. Did you install the "@anthropic-ai/sdk" package?'
    )
  }

  const res = await anthropic.message.create(formattedInput)

  const end = Date.now()

  const formattedOutput = chatOutputAnthropicToLira({
    isStream: input.stream,
    output: res,
  })

  return {
    res: formattedOutput,
    reqTime: {
      start,
      end,
    },
  }
}
