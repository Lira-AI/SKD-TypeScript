import Anthropic from '@anthropic-ai/sdk'
import { LiraMessageOutput } from '@lira/messages/output/types'
import {
  AggregateFunction,
  BufferingBeweenFunction,
} from '@lira/messages/output/stream/types'
import { isEmptyObject } from '@lira/commons/utils/object'

export const startBuffering: BufferingBeweenFunction<
  Anthropic.Messages.RawMessageStreamEvent
> = ({ item }) => {
  switch (item.type) {
    case 'message_start':
      return true

    default:
      return false
  }
}

export const endBuffering: BufferingBeweenFunction<
  Anthropic.Messages.RawMessageStreamEvent
> = ({ item }) => {
  switch (item.type) {
    case 'content_block_start':
      return true

    default:
      return false
  }
}

export const aggregator: AggregateFunction<
  Anthropic.Messages.RawMessageStreamEvent
> = ({ itemsToBeAggregated }) => {
  let partialOutput = {} as LiraMessageOutput.Stream.Response

  for (const item of itemsToBeAggregated) {
    switch (item.type) {
      case 'message_start':
        partialOutput = {
          id: item.message.id,
          model: item.message.model,
          usage: item.message.usage,
          message: {} as LiraMessageOutput.Stream.Response['message'],
        }
        continue

      case 'content_block_start':
        switch (item.content_block.type) {
          case 'tool_use':
            partialOutput = {
              ...partialOutput,
              message: {
                role: 'tool_use',
                tools: [
                  {
                    type: 'function',
                    data: {
                      name: item.content_block.name,
                      arguments: isEmptyObject(item.content_block.input)
                        ? undefined
                        : (item.content_block.input as string),
                    },
                  },
                ],
              },
            }
            continue

          case 'text':
            partialOutput = {
              ...partialOutput,
              message: {
                role: 'assistant',
                type: 'text',
                content: item.content_block.text,
              },
            }
            continue

          default:
            throw new Error(
              `Aggregator unexpected content block type: ${item.content_block}`
            )
        }

      default:
        throw new Error(`Aggregator unexpected message type: ${item.type}`)
    }
  }

  return { result: partialOutput }
}
