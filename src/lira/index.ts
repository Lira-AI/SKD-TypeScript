import { LiraCommons } from './commons/types'
import { LiraLogger } from './commons/utils/logger'
import { Messages } from './messages/messages'
import { Store } from './store/store'
import { LiraStore } from './store/types'

export type LiraInstanceParams = {
  keys: {
    anthropic?: string
    openAI?: string
  }
  store?: {
    enabled: boolean
    callback?: LiraStore.Callback
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
    this.store = new Store(this, params.store)
  }
}
