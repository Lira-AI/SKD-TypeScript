import { LiraError } from '@lira/commons/utils/errors'
import { LiraMessageInput } from '@lira/message/input/types'
import { isOpenAIModel } from '@providers/openai/utils'
import OpenAI from 'openai'

export type OpenAIMessageInput = OpenAI.Chat.ChatCompletionCreateParams & {
  lira: {
    endUser: Omit<LiraMessageInput.LiraMetadataEndUser, 'passIdToUnderlyingLLM'>
    sessionId?: LiraMessageInput.LiraMetadata['sessionId']
    tags?: LiraMessageInput.LiraMetadata['tags']
  }
}

export function chatInputOpenAIToLira(
  inputParams: OpenAIMessageInput
): LiraMessageInput.Params {
  if (!isOpenAIModel(inputParams.model)) {
    throw new LiraError(`Unsupported model: ${inputParams.model}`)
  }

  return {
    max_tokens: inputParams.max_tokens ?? undefined,
    messages: formatInputMessages(inputParams),
    model: inputParams.model as LiraMessageInput.Params['model'],
    lira: {
      ...(inputParams.user
        ? {
            ...inputParams.lira,
            endUser: {
              ...inputParams.lira.endUser,
              id: inputParams.user,
              passIdToUnderlyingLLM: true,
            },
          }
        : inputParams.lira),
    },
    stop_sequences:
      (typeof inputParams.stop === 'string'
        ? [inputParams.stop]
        : inputParams.stop) ?? undefined,
    stream: inputParams.stream ?? undefined,
    temperature: inputParams.temperature
      ? inputParams.temperature / 2
      : undefined,
    top_p: inputParams.top_p ?? undefined,
    tool_choice: formatToolChoice(inputParams.tool_choice),
    tools: formatTools(inputParams.tools),
    openai_options: {
      frequency_penalty: inputParams.frequency_penalty ?? undefined,
      logit_bias: inputParams.logit_bias ?? undefined,
      logprobs: inputParams.logprobs ?? undefined,
      presence_penalty: inputParams.presence_penalty ?? undefined,
      response_format: inputParams.response_format,
      seed: inputParams.seed ?? undefined,
      stream_options: inputParams.stream_options ?? undefined,
      top_logprobs: inputParams.top_logprobs ?? undefined,
    },
  }
}

function formatInputMessages(
  inputParams: OpenAI.Chat.ChatCompletionCreateParams
): LiraMessageInput.Params['messages'] {
  return inputParams.messages
    .map((message) => {
      switch (message.role) {
        case 'assistant':
          return formatAssistantMessage(message)

        case 'system':
          return {
            role: 'system',
            content: Array.isArray(message.content)
              ? message.content.join(' ')
              : message.content,
          } satisfies LiraMessageInput.SystemMessage

        case 'user':
          return formatUserMessage(message)

        case 'tool':
          return formatToolMessage(message)

        default:
          throw new LiraError(`Unsupported message role: ${message.role}`)
      }
    })
    .filter((message) => message !== undefined)
}

function formatAssistantMessage(
  message: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
): LiraMessageInput.AssistantMessage | undefined {
  if (typeof message.content === 'string') {
    return {
      role: 'assistant',
      type: 'text',
      content: message.content,
    }
  } else {
    return message.content?.reduce(
      (acc: LiraMessageInput.AssistantTextMessage | undefined, content) => {
        switch (content.type) {
          case 'text':
            return {
              role: 'assistant' as const,
              type: 'text' as const,
              content: (acc?.content ?? '') + content.text,
            }

          default:
            throw new LiraError(
              `Unsupported message content type: ${content.type}`
            )
        }
      },
      undefined
    )
  }
}

function formatUserMessage(
  message: OpenAI.Chat.Completions.ChatCompletionUserMessageParam
): LiraMessageInput.UserMessage | undefined {
  if (typeof message.content === 'string') {
    return {
      role: 'user',
      type: 'text',
      content: message.content,
    }
  } else {
    return message.content.reduce(
      (acc: LiraMessageInput.UserMessage | undefined, content) => {
        switch (content.type) {
          case 'text':
            if (acc?.type === 'text') {
              return {
                role: 'user',
                type: 'text',
                content: acc.content + content.text,
              }
            } else {
              return {
                role: 'user',
                type: 'text',
                content: content.text,
              }
            }

          case 'image_url':
            if (acc?.type === 'image') {
              return {
                role: 'user',
                type: 'image',
                content: acc.content.concat({
                  type: 'url',
                  url: content.image_url.url,
                  detail: content.image_url.detail,
                }),
              }
            }
        }
      },
      undefined
    )
  }
}

function formatToolMessage(
  message: OpenAI.Chat.Completions.ChatCompletionToolMessageParam
): LiraMessageInput.ToolResultMessage | undefined {
  return {
    role: 'tool_result',
    tools:
      typeof message.content === 'string'
        ? [
            {
              type: 'function',
              data: {
                name: message.tool_call_id,
                result: message.content,
              },
            },
          ]
        : message.content.map((tool) => ({
            type: 'function',
            data: {
              name: message.tool_call_id,
              result: tool.text,
            },
          })),
  }
}

function formatToolChoice(
  toolChoice: OpenAI.Chat.ChatCompletionCreateParams['tool_choice']
): LiraMessageInput.Params['tool_choice'] {
  if (!toolChoice) return undefined

  if (typeof toolChoice === 'string') {
    return {
      type: toolChoice,
    }
  } else {
    return {
      type: 'tool',
      name: toolChoice.function.name,
    }
  }
}

function formatTools(
  tools: OpenAI.Chat.ChatCompletionCreateParams['tools']
): LiraMessageInput.Params['tools'] {
  return tools?.map((tool) => ({
    type: 'function',
    data: {
      name: tool.function.name,
      description: tool.function.description,
      properties: (tool.function.parameters as Record<string, unknown>)
        .properties as Record<string, unknown>,
      required: (tool.function.parameters as Record<string, unknown>)
        .required as Array<string>,
    },
  }))
}
