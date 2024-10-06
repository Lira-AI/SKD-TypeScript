import { LiraMessageOutput } from '@lira/message/output/types'
import { ChatCompletionChunk } from 'openai/resources'
import { formatStopReason } from './shared'
import {
  ConverterFunction,
  StreamContext,
} from '@lira/message/output/stream/types'

export const streamOutputConverter: ConverterFunction<ChatCompletionChunk> = ({
  output,
  context,
}) => {
  const choice = output.choices[0]

  if (!choice) {
    throw new Error('No message found in the output')
  }

  const { message, newContext } = formatMessage({
    firstChoice: choice,
    context,
  })

  return {
    result: {
      id: output.id,
      model: output.model,
      usage: {
        input_tokens: output.usage?.prompt_tokens,
        output_tokens: output.usage?.completion_tokens,
      },
      message,
      ...(choice && {
        logprobs: formatLogProbs(choice),
        stop_reason: formatStopReason(choice.finish_reason),
      }),
      openai_options: {
        created: output.created,
        service_tier: output.service_tier || undefined,
        system_fingerprint: output.system_fingerprint,
      },
    },
    context: newContext,
  }
}

function formatMessage({
  firstChoice,
  context,
}: {
  firstChoice: ChatCompletionChunk.Choice
  context: StreamContext
}): {
  message: LiraMessageOutput.Stream.Response['message']
  newContext: StreamContext
} {
  if (!context?.role) {
    const role =
      !firstChoice.delta.content && firstChoice.delta.tool_calls?.length
        ? 'tool_use'
        : 'assistant'

    const message =
      role === 'tool_use'
        ? formatToolUseChoice(firstChoice)
        : formatAssistantChoice(firstChoice)

    return {
      message,
      newContext: { ...context, role },
    }
  }

  const message =
    context.role === 'tool_use'
      ? formatToolUseChoice(firstChoice)
      : formatAssistantChoice(firstChoice)

  return {
    message,
    newContext: { ...context },
  }
}

function formatToolUseChoice(
  choice: ChatCompletionChunk.Choice
): LiraMessageOutput.Stream.Response['message'] {
  return {
    role: 'tool_use',
    tools: choice.delta.tool_calls?.map((toolCall) => ({
      type: toolCall.type,
      data: {
        id: toolCall.id,
        arguments: toolCall.function?.arguments,
        name: toolCall.function?.name,
      },
    })),
  }
}

function formatAssistantChoice(
  choice: ChatCompletionChunk.Choice
): LiraMessageOutput.Stream.Response['message'] {
  return {
    role: 'assistant',
    type: 'text',
    content: choice.delta.content || '',
  }
}

function formatLogProbs(
  choice: ChatCompletionChunk.Choice
): LiraMessageOutput.Stream.Response['logprobs'] {
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
