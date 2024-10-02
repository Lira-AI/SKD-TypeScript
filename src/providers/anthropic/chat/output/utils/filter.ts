import { RawMessageStreamEvent } from '@anthropic-ai/sdk/resources'
import { FilterFunction } from '@lira/messages/output/stream/types'

export const filterMessageStopType: FilterFunction<RawMessageStreamEvent> = ({
  item,
}) => {
  // From the doc they are not clear about sending ping type events [Here](https://docs.anthropic.com/en/api/messages-streaming#ping-events)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (item.type === ('ping' as any)) {
    return {
      result: true,
    }
  }

  return {
    result: item.type === 'message_stop' || item.type === 'content_block_stop',
  }
}
