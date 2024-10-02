import { LiraMessageOutput } from '../types'
import { LiraMessageOutputStore } from './types'

export async function formatStreamToStore(
  output: AsyncIterable<LiraMessageOutput.Stream.Response>
): Promise<Omit<LiraMessageOutputStore, 'reqTimes'>> {
  const formattedOutputMessages: Array<LiraMessageOutput.Stream.Response> = []

  for await (const message of output) {
    formattedOutputMessages.push(message)
  }

  const formattedOutput = formattedOutputMessages.reduce(
    (aggregatedOutput: LiraMessageOutputStore, chunk) => {
      aggregatedOutput = {
        id: aggregatedOutput?.id ?? chunk.id,
        model: aggregatedOutput?.model ?? chunk.model,
        usage: {
          input_tokens:
            (aggregatedOutput?.usage?.input_tokens ?? 0) +
            (chunk.usage?.input_tokens ?? 0),
          output_tokens:
            (aggregatedOutput?.usage?.output_tokens ?? 0) +
            (chunk.usage?.output_tokens ?? 0),
        },
        message: formatMessage({
          outputChoice: aggregatedOutput.message,
          chunkChoice: chunk.message,
        }),
        stop_reason: aggregatedOutput.stop_reason ?? chunk.stop_reason,
        logprobs: aggregatedOutput.logprobs ?? chunk.logprobs,
        stop_sequence: aggregatedOutput.stop_sequence ?? chunk.stop_sequence,
        openai_options: {
          created:
            aggregatedOutput?.openai_options?.created ??
            chunk.openai_options?.created,
          service_tier:
            aggregatedOutput?.openai_options?.service_tier ??
            chunk.openai_options?.service_tier,
          system_fingerprint:
            aggregatedOutput?.openai_options?.system_fingerprint ??
            chunk.openai_options?.system_fingerprint,
        },
      }

      return aggregatedOutput
    },
    {} as LiraMessageOutputStore
  )

  return formattedOutput
}

function formatMessage({
  outputChoice,
  chunkChoice,
}: {
  outputChoice: LiraMessageOutputStore['message']
  chunkChoice: LiraMessageOutput.Stream.Response['message']
}): LiraMessageOutputStore['message'] {
  if (chunkChoice.role === 'assistant' && outputChoice.role === 'assistant') {
    if (!chunkChoice.content) {
      return {
        role: chunkChoice.role,
        content: outputChoice.content,
      }
    }

    return {
      role: chunkChoice.role,
      type: chunkChoice.type,
      content: outputChoice?.content
        ? outputChoice.content + chunkChoice.content
        : chunkChoice.content,
    }
  }

  if (chunkChoice.role === 'tool_use' && outputChoice.role === 'tool_use') {
    if (!chunkChoice.tools?.length) {
      return {
        role: chunkChoice.role,
        tools: outputChoice.tools,
      }
    }

    return {
      role: chunkChoice.role,
      tools: chunkChoice.tools.map((tool, index) => {
        const outputTool = (
          outputChoice as LiraMessageOutput.Stream.ToolUseResponse
        ).tools?.at(index)

        if (!outputTool) {
          return tool
        }

        return {
          type: tool.type,
          data: {
            name: tool.data?.name ?? outputTool.data?.name,
            arguments: outputTool.data?.arguments
              ? outputTool.data.arguments + tool.data?.arguments
              : tool.data?.arguments,
          },
        }
      }),
    }
  }

  throw new Error('Role mismatch')
}
