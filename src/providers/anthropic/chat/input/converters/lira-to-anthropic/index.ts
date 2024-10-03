import {
  MessageCreateParamsBase,
  MessageParam,
} from '@anthropic-ai/sdk/resources/messages'
import { LiraMessageInput } from '@lira/messages/input/types'
import { LiraError } from '@lira/commons/utils/errors'
import { LiraLogger } from '@lira/commons/utils/logger'

type ExcludeString<T> = T extends string ? never : T

type NewMessageParam = {
  role: 'assistant' | 'user'
  content: ExcludeString<MessageParam['content']>
}

export function chatInputLiraToAntrhopic(
  inputParams: LiraMessageInput.Params
): MessageCreateParamsBase {
  return {
    max_tokens: inputParams.max_tokens ?? 2000,
    messages: formatInputMessages(inputParams.messages),
    model: inputParams.model,
    stop_sequences: inputParams.stop_sequences,
    stream: inputParams.stream,
    system: formatSystem(inputParams.messages),
    temperature: inputParams.temperature,
    tool_choice: formatToolChoice(inputParams.tool_choice),
    tools:
      inputParams.tool_choice?.type === 'none'
        ? undefined
        : formatTools(inputParams.tools),
    top_k: inputParams.anthropic_options?.top_k,
    top_p: inputParams.top_p,
    ...(inputParams.metadata?.endUser?.passIdToUnderlyingLLM && {
      end_user: inputParams.metadata.endUser.id,
    }),
  }
}

function formatInputMessages(
  messages: LiraMessageInput.Params['messages']
): Array<NewMessageParam> {
  const messagesExceptSystem = messages.filter(
    (message) => message.role !== 'system'
  )

  const formattedMessages: Array<NewMessageParam> = []
  const equalRoleMessages: LiraMessageInput.Params['messages'] = []

  const flushEqualRoleMessages = () => {
    if (equalRoleMessages.length === 0) {
      return
    }

    const formattedEqualRoleMessages = formatMessages(equalRoleMessages)
    formattedMessages.push(formattedEqualRoleMessages)
    equalRoleMessages.length = 0
  }

  messagesExceptSystem.forEach((currentMessage, currentMessageIndex) => {
    const lastMessage = messagesExceptSystem.at(currentMessageIndex - 1)

    if (lastMessage?.role === currentMessage.role) {
      equalRoleMessages.push(currentMessage)
    } else {
      flushEqualRoleMessages()
      equalRoleMessages.push(currentMessage)
    }
  })

  flushEqualRoleMessages()

  return formattedMessages
}

function formatMessages(
  equalRoleMessages: LiraMessageInput.Params['messages']
): NewMessageParam {
  const formattedMessages = equalRoleMessages.map(formatMessage)

  const role = formattedMessages.at(0)?.role

  if (!role) {
    throw new LiraError('Cannot determine message role')
  }

  return {
    role,
    content: formattedMessages.flatMap((message) => message.content),
  }
}

function formatMessage(
  message: LiraMessageInput.Params['messages'][0]
): NewMessageParam {
  switch (message.role) {
    case 'assistant':
      return {
        role: 'assistant',
        content: formatAssistantAndUserMessage(message),
      }

    case 'user':
      return {
        role: 'user',
        content: formatAssistantAndUserMessage(message),
      }

    case 'tool_result':
      return {
        role: 'user',
        content: message.tools.map((toolResultData) => ({
          type: 'tool_result',
          tool_use_id: toolResultData.data.name,
          content: toolResultData.data.result,
          is_error: toolResultData.is_error,
        })),
      }

    default:
      throw new LiraError(
        `Unsupported message role: ${message.role} for Assistant`
      )
  }
}

function formatAssistantAndUserMessage(
  message: LiraMessageInput.AssistantMessage | LiraMessageInput.UserMessage
): NewMessageParam['content'] {
  switch (message.type) {
    case 'text':
      return [
        {
          type: 'text',
          text: message.content,
        },
      ]

    case 'image':
      if (message.content.some((image) => image.type === 'url')) {
        LiraLogger.warn(
          'Image message type "url" is not supported by Anthropic. The image will be ignored.'
        )
        return []
      }

      return message.content
        .filter((image) => image.type !== 'url')
        .map((image) => ({
          type: 'image',
          source: {
            type: 'base64',
            data: image.source,
            media_type: image.media_type,
          },
        }))

    default:
      throw new LiraError(`Unsupported message type: ${message}`)
  }
}

function formatSystem(
  messages: LiraMessageInput.Params['messages']
): MessageCreateParamsBase['system'] {
  const systemMessages = messages.filter((message) => message.role === 'system')

  return systemMessages.flatMap((message) => ({
    type: 'text',
    text: message.content,
  }))
}

function formatToolChoice(
  toolChoice: LiraMessageInput.Params['tool_choice']
): MessageCreateParamsBase['tool_choice'] {
  switch (toolChoice?.type) {
    case 'none':
      return undefined

    case 'required':
      return {
        type: 'any',
      }

    default:
      return toolChoice
  }
}

function formatTools(
  tools: LiraMessageInput.Params['tools']
): MessageCreateParamsBase['tools'] {
  return tools?.map((tool) => ({
    name: tool.data.name,
    description: tool.data.description,
    input_schema: {
      type: 'object',
      properties: tool.data.properties,
      required: tool.data.required || [],
    },
  }))
}
