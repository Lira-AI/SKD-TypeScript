import { LiraCommons } from './commons/types'
import { LiraLogger } from './commons/utils/logger'
import { Message } from './message/message'
import { Store } from './store/store'
import { LiraStore } from './store/types'

export type LiraInstanceParams = {
  keys: {
    lira?: string
    anthropic?: string
    openAI?: string
  }
  loggers?: {
    type?: LiraCommons.Logger
    config?: LiraCommons.LoggerConfig
  }
  store?: {
    enabled: boolean
    callback?: LiraStore.Callback
  }
}

export class Lira {
  public message: Message

  public store: Store

  constructor(params: LiraInstanceParams) {
    LiraLogger.initialize({
      type: params.loggers?.type,
      loggers: params.loggers?.config,
    })

    this.message = new Message(this, params.keys, params.store)
    this.store = new Store(this, params.store, params.keys.lira)
  }
}
