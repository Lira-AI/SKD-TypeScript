import { LiraCommons } from './commons/types'
import { LiraLogger } from './commons/utils/logger'
import { LiraMessage } from './messages/commons/types'
import { Messages } from './messages/messages'

export type LiraInstanceParams = {
  keys: {
    anthropic?: string
    openAI?: string
  }
  store?: {
    enabled: boolean
    callback?: (params: LiraMessage.Store) => unknown
  }
  loggers?: {
    type?: LiraCommons.Logger
    config?: LiraCommons.LoggerConfig
  }
}

export class Lira {
  public messages: Messages

  constructor(params: LiraInstanceParams) {
    LiraLogger.initialize({
      type: params.loggers?.type,
      loggers: params.loggers?.config,
    })

    this.messages = new Messages(params.keys, params.store)
  }
}
