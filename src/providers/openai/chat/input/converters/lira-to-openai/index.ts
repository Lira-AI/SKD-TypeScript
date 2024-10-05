import OpenAI from 'openai'
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
  ChatCompletionUserMessageParam,
} from 'openai/resources'
import { LiraError } from '@lira/commons/utils/errors'
import { LiraMessageInput } from '@lira/messages/input/types'

export function chatInputLiraToOpenAI(
  inputParams: LiraMessageInput.Params
): OpenAI.Chat.ChatCompletionCreateParams {
  const streamOptions = inputParams.openai_options?.stream_options
    ?.include_usage
    ? inputParams.openai_options?.stream_options
    : { ...inputParams.openai_options?.stream_options, include_usage: true }

  return {
    messages: formatInputMessages(inputParams.messages),
    model: inputParams.model,
    frequency_penalty: inputParams.openai_options?.frequency_penalty,
    logit_bias: inputParams.openai_options?.logit_bias,
    logprobs: inputParams.openai_options?.logprobs,
    max_tokens: inputParams.max_tokens,
    presence_penalty: inputParams.openai_options?.presence_penalty,
    response_format: inputParams.openai_options?.response_format,
    seed: inputParams.openai_options?.seed,
    stop: inputParams.stop_sequences,
    stream: inputParams.stream,
    stream_options: inputParams.stream ? streamOptions : undefined,
    temperature: inputParams.temperature
      ? inputParams.temperature * 2
      : undefined,
    ...(inputParams.tools?.length && {
      tool_choice: formatToolChoice(inputParams.tool_choice),
    }),
    tools: inputParams.tools?.length
      ? inputParams.tools.map(formatTool)
      : undefined,
    top_logprobs: inputParams.openai_options?.top_logprobs,
    top_p: inputParams.top_p,
    ...(inputParams.lira?.endUser?.passIdToUnderlyingLLM && {
      user: inputParams.lira.endUser.id,
    }),
  } satisfies OpenAI.Chat.ChatCompletionCreateParams
}

function formatInputMessages(
  messages: LiraMessageInput.Params['messages']
): ChatCompletionMessageParam[] {
  const formattedMessages: ChatCompletionMessageParam[] = []
  const equalRoleMessages: ChatCompletionMessageParam[] = []

  const flushEqualRoleMessages = () => {
    formattedMessages.push(...equalRoleMessages)
    equalRoleMessages.length = 0
  }

  for (const message of messages) {
    const lastMessage = equalRoleMessages.at(-1) || formattedMessages.at(-1)

    switch (message.role) {
      case 'assistant':
        const formattedAssistantMessage = formatAssistantMessage(message)
        if (lastMessage?.role === 'assistant') {
          equalRoleMessages.push(formattedAssistantMessage)
        } else {
          flushEqualRoleMessages()
          equalRoleMessages.push(formattedAssistantMessage)
        }
        break
      case 'system':
        if (lastMessage?.role === 'system') {
          equalRoleMessages.push({ role: 'system', content: message.content })
        } else {
          flushEqualRoleMessages()
          equalRoleMessages.push({ role: 'system', content: message.content })
        }
        break
      case 'user':
        const formattedUserMessage = formatUserMessage(message)
        if (lastMessage?.role === 'user') {
          equalRoleMessages.push(formattedUserMessage)
        } else {
          flushEqualRoleMessages()
          equalRoleMessages.push(formattedUserMessage)
        }
        break
      case 'tool_result':
        const formattedToolResults = message.tools.map((toolResult) => ({
          role: 'tool',
          content: toolResult.data.result,
          tool_call_id: toolResult.data.name,
        })) satisfies Array<ChatCompletionMessageParam>
        if (lastMessage?.role === 'tool') {
          equalRoleMessages.push(...formattedToolResults)
        } else {
          flushEqualRoleMessages()
          equalRoleMessages.push(...formattedToolResults)
        }
        break
      default:
        throw new LiraError(`Unknown role: ${message}`)
    }
  }

  flushEqualRoleMessages()

  return formattedMessages
}

function formatAssistantMessage(
  message: LiraMessageInput.AssistantMessage
): ChatCompletionAssistantMessageParam {
  switch (message.type) {
    case 'text':
      return {
        role: 'assistant',
        content: message.content,
      }

    case 'image':
      throw new LiraError(
        `Image message data type not supported for OpenAI assistant: ${message}`
      )

    default:
      throw new LiraError(
        `Message data type not supported for OpenAI assistant: ${message}`
      )
  }
}

function formatUserMessage(
  message: LiraMessageInput.UserMessage
): ChatCompletionUserMessageParam {
  switch (message.type) {
    case 'text':
      return { role: 'user', content: message.content }

    case 'image':
      return {
        role: 'user',
        content: message.content.map((img) => {
          switch (img.type) {
            case 'url':
              return {
                type: 'image_url',
                image_url: {
                  url: img.url,
                  detail: img.detail,
                },
              }

            case 'base64':
              return {
                type: 'image_url',
                image_url: {
                  url: img.source,
                  detail: img.detail,
                },
              }

            default:
              throw new LiraError(
                `Image message content type not supported for OpenAI user: ${img}`
              )
          }
        }),
      }
    default:
      throw new LiraError(
        `Message data type not supported for OpenAI user: ${message}`
      )
  }
}

function formatToolChoice(
  toolChoice: LiraMessageInput.Params['tool_choice']
): ChatCompletionToolChoiceOption {
  switch (toolChoice?.type) {
    case 'auto':
    case 'none':
    case 'required':
      return toolChoice.type

    case 'tool':
      return {
        type: 'function',
        function: {
          name: toolChoice.name,
        },
      }

    default:
      return 'auto'
  }
}

function formatTool(tool: LiraMessageInput.Tool): ChatCompletionTool {
  return {
    type: 'function',
    function: {
      name: tool.data.name,
      description: tool.data.description,
      parameters: {
        type: 'object',
        properties: tool.data.properties,
        required: tool.data.required || [],
      },
    },
  }
}
