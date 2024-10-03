import {
  MessageCreateParamsBase,
  MessageParam,
} from '@anthropic-ai/sdk/resources/messages'
import { LiraError } from '@lira/commons/utils/errors'
import { LiraMessageInput } from '@lira/messages/input/types'
import { isAnthropicModel } from '@providers/anthropic/utils'

export function chatInputAntrhopicToLira(
  inputParams: MessageCreateParamsBase
): LiraMessageInput.Params {
  if (!isAnthropicModel(inputParams.model)) {
    throw new LiraError(`Unsupported model: ${inputParams.model}`)
  }

  return {
    max_tokens: inputParams.max_tokens,
    messages: formatInputMessages(inputParams),
    model: inputParams.model as LiraMessageInput.Params['model'],
    metadata: {
      ...(inputParams.metadata?.user_id && {
        endUser: {
          passIdToUnderlyingLLM: true,
          id: inputParams.metadata.user_id,
        },
      }),
    },
    stop_sequences: inputParams.stop_sequences,
    stream: inputParams.stream,
    temperature: inputParams.temperature,
    top_p: inputParams.top_p,
    tool_choice: formatToolChoice(inputParams.tool_choice),
    tools: formatTools(inputParams.tools),
    anthropic_options: {
      top_k: inputParams.top_k,
    },
  }
}

function formatInputMessages(
  inputParams: MessageCreateParamsBase
): LiraMessageInput.Params['messages'] {
  const systemMessage: LiraMessageInput.SystemMessage | null =
    inputParams.system
      ? {
          role: 'system',
          content: Array.isArray(inputParams.system)
            ? inputParams.system.join(' ')
            : inputParams.system,
        }
      : null

  const messages = inputParams.messages.flatMap((message) =>
    formatMessage(message.content, message.role)
  )

  return systemMessage ? [systemMessage, ...messages] : messages
}

function formatMessage(
  messageContent: MessageParam['content'],
  role: MessageParam['role']
): LiraMessageInput.Params['messages'] {
  if (typeof messageContent === 'string') {
    return [
      {
        role,
        type: 'text',
        content: messageContent,
      },
    ]
  } else {
    return messageContent.flatMap((content) => {
      switch (content.type) {
        case 'text':
          return {
            role,
            type: 'text',
            content: content.text,
          } satisfies LiraMessageInput.Params['messages'][0]

        case 'image':
          return {
            role,
            type: 'image',
            content: [
              {
                type: 'base64',
                source: content.source.data,
                media_type: content.source.media_type,
              },
            ],
          } satisfies LiraMessageInput.Params['messages'][0]

        case 'tool_result':
          if (typeof content.content === 'string') {
            return {
              role: 'tool_result',
              tools: [
                {
                  type: 'function',
                  data: {
                    result: content.content,
                    name: content.tool_use_id,
                  },
                },
              ],
            } satisfies LiraMessageInput.Params['messages'][0]
          } else {
            return {
              role: 'tool_result',
              tools: [
                {
                  type: 'function',
                  data: {
                    result:
                      content.content
                        ?.map((toolResultData) =>
                          toolResultData.type === 'text'
                            ? toolResultData.text
                            : toolResultData.source.data
                        )
                        .join(' ') || '',
                    name: content.tool_use_id,
                  },
                },
              ],
            }
          }

        default:
          throw new LiraError(
            `Unsupported message content type: ${content.type}`
          )
      }
    })
  }
}

function formatToolChoice(
  toolChoice: MessageCreateParamsBase['tool_choice']
): LiraMessageInput.Params['tool_choice'] {
  switch (toolChoice?.type) {
    case 'auto':
      return {
        type: 'auto',
      }

    case 'tool':
      return {
        type: 'tool',
        name: toolChoice.name,
      }

    case 'any':
      return {
        type: 'required',
      }

    default:
      return toolChoice
  }
}

function formatTools(
  tools: MessageCreateParamsBase['tools']
): LiraMessageInput.Params['tools'] {
  return tools?.map((tool) => ({
    type: 'function',
    data: {
      name: tool.name,
      description: tool.description,
      properties: tool.input_schema?.properties as Record<string, unknown>,
      required: (tool.input_schema?.required as Array<string>) || [],
    },
  }))
}
