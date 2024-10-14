import {
  RawContentBlockDeltaEvent,
  RawContentBlockStartEvent,
  RawContentBlockStopEvent,
  RawMessageDeltaEvent,
  RawMessageStartEvent,
  RawMessageStopEvent,
} from '@anthropic-ai/sdk/resources'
import { LiraMessageOutput } from '@lira/message/output/types'
import { formatStopReason } from './shared'
import { ConverterFunction } from '@lira/message/output/stream/types'

export const streamOutputConverter: ConverterFunction<
  | RawMessageStartEvent
  | RawMessageDeltaEvent
  | RawMessageStopEvent
  | RawContentBlockStartEvent
  | RawContentBlockDeltaEvent
  | RawContentBlockStopEvent
> = ({ output }) => {
  switch (output.type) {
    // Cases for message_start, content_block_start, content_block_stop and message_stop are handled in the aggregator function and in the filter function
    case 'content_block_delta':
      return { result: formatContentBlockDelta(output) }

    case 'message_delta':
      return { result: formatMessageDelta(output) }

    case 'message_start':
    case 'content_block_start':
    case 'content_block_stop':
    case 'message_stop':
      throw new Error(`Unexpected message type: ${output.type}`)

    default:
      throw new Error(`Unexpected message type: ${output}`)
  }
}

function formatContentBlockDelta(
  response: RawContentBlockDeltaEvent
): LiraMessageOutput.Stream.Response {
  switch (response.delta.type) {
    case 'text_delta':
      return {
        message: {
          role: 'assistant',
          type: 'text',
          content: response.delta.text,
        },
      }

    case 'input_json_delta':
      return {
        message: {
          role: 'tool_use',
          tools: [
            {
              type: 'function',
              data: {
                arguments: response.delta.partial_json,
              },
            },
          ],
        },
      }

    default:
      throw new Error(`Unexpected content block delta type: ${response}`)
  }
}

function formatMessageDelta(
  response: RawMessageDeltaEvent
): LiraMessageOutput.Stream.Response {
  switch (response.delta.stop_reason) {
    case 'tool_use':
      return {
        message: {
          role: 'tool_use',
        },
        stop_reason: formatStopReason(response.delta.stop_reason),
        stop_sequence: response.delta.stop_sequence || undefined,
        usage: {
          output_tokens: response.usage.output_tokens,
        },
      }

    case 'end_turn':
    case 'max_tokens':
    case 'stop_sequence':
      return {
        message: {
          role: 'assistant',
        },
        stop_reason: formatStopReason(response.delta.stop_reason),
        stop_sequence: response.delta.stop_sequence || undefined,
        usage: {
          output_tokens: response.usage.output_tokens,
        },
      }

    default:
      throw new Error(
        `Unexpected message delta stop reason: ${response.delta.stop_reason}`
      )
  }
}
