import { LiraCommons } from '@lira/commons/types'
import { ROLES } from '../commons/constants'
import { LiraMessage } from '../commons/types'

export namespace LiraMessageOutput {
  type StopReason = 'max_tokens' | 'stop_sequence' | 'stop'

  export type RequestTime = { start: number; end: number }

  type Bytes = Array<number>

  type Logprobs = Array<{
    token: string
    logprob: number
    bytes?: Bytes
    top_logprobs?: Array<{ token: string; logprob: number; bytes?: Bytes }>
  }>

  export type ToolUseMessageData = {
    type: 'function'
    data: {
      arguments: string
      name: string
    }
  }

  export namespace Stream {
    export type AssistantResponse = {
      role: typeof ROLES.ASSISTANT
      type?: 'text'
      content?: LiraMessage.TextMessageData
    }

    export type ToolUseResponse = {
      role: typeof ROLES.TOOL_USE
      tools?: Array<LiraCommons.DeepPartial<ToolUseMessageData>>
    }

    export type Response = {
      id?: string
      model?: string
      usage?: {
        input_tokens?: number
        output_tokens?: number
      }
      message: AssistantResponse | ToolUseResponse
      stop_reason?: StopReason
      stop_sequence?: string
      logprobs?: Logprobs
      openai_options?: {
        created?: number
        service_tier?: 'scale' | 'default'
        system_fingerprint?: string
      }
    }
  }

  export namespace Static {
    type AssistantResponse = {
      role: typeof ROLES.ASSISTANT
      type: 'text'
      content: LiraMessage.TextMessageData
    }

    type ToolUseResponse = {
      role: typeof ROLES.TOOL_USE
      tools: Array<ToolUseMessageData>
    }

    export type Response = {
      id: string
      model: string
      usage?: {
        input_tokens?: number
        output_tokens?: number
      }
      message: AssistantResponse | ToolUseResponse
      logprobs?: Logprobs
      stop_reason: StopReason
      stop_sequence?: string
      openai_options?: {
        created: number
        service_tier?: 'scale' | 'default'
        system_fingerprint?: string
      }
    }
  }
}
