import { LiraCommons } from './commons/types'
import { LiraLogger } from './commons/utils/logger'
import { LiraMessage } from './messages/commons/types'
import { Messages } from './messages/messages'
import { Store } from './store/store'

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

  public store: Store

  constructor(params: LiraInstanceParams) {
    LiraLogger.initialize({
      type: params.loggers?.type,
      loggers: params.loggers?.config,
    })

    this.messages = new Messages(this, params.keys)
    this.store = new Store(params.store)
  }
}
