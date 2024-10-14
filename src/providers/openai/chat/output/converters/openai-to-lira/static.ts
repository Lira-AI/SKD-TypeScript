import { ChatCompletion } from 'openai/resources'
import { LiraMessageOutput } from '@lira/message/output/types'
import { formatStopReason } from './shared'

export function staticOutputConverter(
  output: ChatCompletion
): LiraMessageOutput.Static.Response {
  const choice = output.choices[0]

  if (!choice) {
    throw new Error('No message found in the output')
  }

  return {
    id: output.id,
    model: output.model,
    usage: {
      input_tokens: output.usage?.prompt_tokens,
      output_tokens: output.usage?.completion_tokens,
    },
    message: formatChoice(choice),
    ...(choice && {
      logprobs: formatLogProbs(choice),
    }),
    stop_reason: formatStopReason(choice.finish_reason),
    openai_options: {
      created: output.created,
      service_tier: output.service_tier || undefined,
      system_fingerprint: output.system_fingerprint,
    },
  }
}

function formatChoice(
  choice: ChatCompletion.Choice
): LiraMessageOutput.Static.Response['message'] {
  if (choice.message.content === null && choice.message.tool_calls?.length) {
    return {
      role: 'tool_use',
      tools: choice.message.tool_calls.map((toolCall) => ({
        type: toolCall.type,
        data: {
          id: toolCall.id,
          arguments: JSON.parse(toolCall.function?.arguments),
          name: toolCall.function?.name,
        },
      })),
    }
  }

  return {
    role: 'assistant',
    type: 'text',
    content: choice.message.content || '',
  }
}

function formatLogProbs(
  choice: ChatCompletion.Choice
): LiraMessageOutput.Static.Response['logprobs'] {
  return choice.logprobs?.content?.map((logprob) => ({
    token: logprob.token,
    logprob: logprob.logprob,
    bytes: logprob.bytes || undefined,
    top_logprobs: logprob.top_logprobs?.map((topLogprob) => ({
      token: topLogprob.token,
      logprob: topLogprob.logprob,
      bytes: topLogprob.bytes || undefined,
    })),
  }))
}
