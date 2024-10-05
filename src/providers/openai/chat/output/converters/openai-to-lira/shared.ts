import { ChatCompletion, ChatCompletionChunk } from 'openai/resources'
import { LiraMessageOutput } from '@lira/messages/output/types'

export function formatStopReason(
  finishReason: ChatCompletion.Choice['finish_reason']
): LiraMessageOutput.Static.Response['stop_reason']
export function formatStopReason(
  finishReason: ChatCompletionChunk.Choice['finish_reason']
): LiraMessageOutput.Stream.Response['stop_reason']
export function formatStopReason(
  finishReason:
    | ChatCompletion.Choice['finish_reason']
    | ChatCompletionChunk.Choice['finish_reason']
):
  | LiraMessageOutput.Static.Response['stop_reason']
  | LiraMessageOutput.Stream.Response['stop_reason'] {
  switch (finishReason) {
    case 'length':
      return 'max_tokens'
    case 'content_filter':
      return 'stop_sequence'
    case 'stop':
    case 'function_call':
    case 'tool_calls':
      return 'stop'
  }
}
