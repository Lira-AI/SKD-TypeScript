import { RawMessageDeltaEvent } from '@anthropic-ai/sdk/resources'
import { LiraMessageOutput } from '@lira/message/output/types'

export function formatStopReason(
  stopReason: RawMessageDeltaEvent.Delta['stop_reason']
): LiraMessageOutput.Stream.Response['stop_reason'] {
  switch (stopReason) {
    case 'max_tokens':
    case 'stop_sequence':
      return stopReason

    case 'end_turn':
    case 'tool_use':
      return 'stop'

    default:
      throw new Error(`Unexpected stop reason: ${stopReason}`)
  }
}
