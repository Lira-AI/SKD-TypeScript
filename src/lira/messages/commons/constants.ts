export const ANTHROPIC_MODELS = {
  CLAUDE_3_5_SONNET_20240620: 'claude-3-5-sonnet-20240620',
  CLAUDE_3_OPUS_20240229: 'claude-3-opus-20240229',
  CLAUDE_3_SONNET_20240229: 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU_20240307: 'claude-3-haiku-20240307',
} as const

export const OPENAI_MODELS = {
  GPT_4_O: 'gpt-4o',
  GPT_4_O_2024_05_13: 'gpt-4o-2024-05-13',
  GPT_4_O_2024_08_06: 'gpt-4o-2024-08-06',
  GPT_4_O_LATEST: 'gpt-4o-latest',
  GPT_4_O_MINI: 'gpt-4o-mini',
  GPT_4_O_MINI_2024_07_18: 'gpt-4o-mini-2024-07-18',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4_TURBO_2024_04_09: 'gpt-4-turbo-2024-04-09',
  GPT_4_0125_PREVIEW: 'gpt-4-0125-preview',
  GPT_4_1106_PREVIEW: 'gpt-4-1106-preview',
  GPT_4: 'gpt-4',
  GPT_4_32K: 'gpt-4-32k',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_3_5_TURBO_1106: 'gpt-3.5-turbo-1106',
  GPT_3_5_TURBO_0125: 'gpt-3.5-turbo-0125',
  GPT_3_5_TURBO_INSTRUCT: 'gpt-3.5-turbo-instruct',
} as const

export const ROLES = {
  ASSISTANT: 'assistant',
  USER: 'user',
  TOOL_USE: 'tool_use',
  TOOL_RESULT: 'tool_result',
  SYSTEM: 'system',
} as const