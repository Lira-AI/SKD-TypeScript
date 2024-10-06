import { Message } from '@anthropic-ai/sdk/resources'
import { LiraMessageOutput } from '@lira/message/output/types'
import { formatStopReason } from './shared'

export function staticOutputConverter(
  message: Message
): LiraMessageOutput.Static.Response {
  const content = message.content[0]
  if (!content) {
    throw new Error('No content found in response message')
  }

  switch (content.type) {
    case 'text':
      return {
        id: message.id,
        model: message.model,
        usage: message.usage,
        stop_reason: formatStopReason(message.stop_reason) || 'stop',
        stop_sequence: message.stop_sequence ?? undefined,
        message: {
          role: 'assistant',
          type: 'text',
          content: content.text,
        },
      }

    case 'tool_use':
      return {
        id: message.id,
        model: message.model,
        usage: message.usage,
        stop_reason: formatStopReason(message.stop_reason) || 'stop',
        stop_sequence: message.stop_sequence ?? undefined,
        message: {
          role: 'tool_use',
          tools: [
            {
              type: 'function',
              data: {
                arguments: content.input as string,
                name: content.name,
              },
            },
          ],
        },
      }

    default:
      throw new Error(`Unknown message type: ${content}`)
  }
}
