import { LiraInstanceParams } from '@lira/index'
import { ANTHROPIC_MODELS, OPENAI_MODELS, ROLES } from '../commons/constants'
import { LiraMessage } from '../commons/types'

export namespace LiraMessageInput {
  export type LiraMetadata = {
    endUser?: {
      id: string
      name?: string
      passIdToUnderlyingLLM?: boolean
    }
    sessionId?: string
    tags?: string[]
    store?: LiraInstanceParams['store']
  }

  /**
   * @Anthropic Accepts Base64 encoded
   * @OpenAI Accepts Base64 encoded or URLs
   */
  export type ImageMessageData = Array<
    | {
        type: 'url'
        url: string
        /**
         * @Anthropic Not supported
         */
        detail?: 'auto' | 'low' | 'high'
      }
    | {
        type: 'base64'
        source: string
        /**
         * @OpenAI Not supported
         */
        media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
        /**
         * @Anthropic Not supported
         */
        detail?: 'auto' | 'low' | 'high'
      }
  >

  export type ToolResultMessageData = {
    type: 'function'
    data: {
      result: LiraMessage.TextMessageData
      name: string
    }
    is_error?: boolean
  }

  export type SystemMessage = {
    role: typeof ROLES.SYSTEM
    content: LiraMessage.TextMessageData
  }

  export type UserTextMessage = {
    role: typeof ROLES.USER
    type: 'text'
    content: LiraMessage.TextMessageData
  }

  export type UserImageMessage = {
    role: typeof ROLES.USER
    type: 'image'
    content: ImageMessageData
  }

  export type UserMessage = UserTextMessage | UserImageMessage

  export type AssistantTextMessage = {
    role: typeof ROLES.ASSISTANT
    type: 'text'
    content: LiraMessage.TextMessageData
  }

  export type AssistantImageMessage = {
    role: typeof ROLES.ASSISTANT
    type: 'image'
    content: ImageMessageData
  }

  export type AssistantMessage = AssistantTextMessage | AssistantImageMessage

  export type ToolResultMessage = {
    role: typeof ROLES.TOOL_RESULT
    tools: Array<ToolResultMessageData>
  }

  export type Message =
    | SystemMessage
    | UserMessage
    | AssistantMessage
    | ToolResultMessage

  export type Tool = {
    type: 'function'
    data: {
      name: string
      description?: string
      properties?: Record<string, unknown>
      required?: Array<string>
    }
  }

  export type AnthropicModels =
    (typeof ANTHROPIC_MODELS)[keyof typeof ANTHROPIC_MODELS]

  export type OpenAIModels = (typeof OPENAI_MODELS)[keyof typeof OPENAI_MODELS]

  type OpenAIResponseFormatBase = {
    type: 'text' | 'json_object'
  }

  type OpenAIResponseFormatJSONSchema = {
    type: 'json_schema'
    json_schema: {
      description?: string
      name: string
      schema?: Record<string, unknown>
      strict?: boolean | null
    }
  }

  export type OpenAIResponseFormat =
    | OpenAIResponseFormatBase
    | OpenAIResponseFormatJSONSchema

  export type OpenAIOptions = {
    presence_penalty?: number
    frequency_penalty?: number
    response_format?: OpenAIResponseFormat
    service_tier?: 'auto' | 'default'
    parallel_tool_calls?: boolean
    logprobs?: boolean
    top_logprobs?: number
    seed?: number
    stream_options?: {
      include_usage?: boolean
    }
    logit_bias?: Record<string, number>
  }

  export type AnthropicOptions = {
    top_k?: number
  }

  export type Params = {
    lira?: LiraMetadata
    /**
     * Defaults to 2000
     */
    max_tokens?: number
    model: AnthropicModels | OpenAIModels
    messages: Array<Message>
    /**
     * Value between 0 and 1. Defaults to 0.5
     */
    temperature?: number
    top_p?: number
    tools?: Array<Tool>
    /**
     * Defaults to 'auto'
     */
    tool_choice?:
      | {
          type: 'auto'
        }
      | {
          type: 'tool'
          name: string
        }
      | {
          type: 'required'
        }
      | {
          type: 'none'
        }
    stop_sequences?: Array<string>
    stream?: boolean
    openai_options?: OpenAIOptions
    anthropic_options?: AnthropicOptions
  }
}
