import { LiraCommons } from '../types'

export class LiraLogger {
  static #instance: LiraLogger

  #loggers: LiraCommons.LoggerConfig | undefined

  private constructor(
    private readonly type?: LiraCommons.Logger,
    loggers?: LiraCommons.LoggerConfig
  ) {
    this.#loggers = loggers
  }

  static initialize({
    type,
    loggers,
  }: {
    type?: LiraCommons.Logger
    loggers?: LiraCommons.LoggerConfig
  }): void {
    if (!LiraLogger.#instance) {
      LiraLogger.#instance = new LiraLogger(type, loggers)
    }
  }

  static #getInstance(): LiraLogger {
    if (!LiraLogger.#instance) {
      throw new Error(
        'LiraLogger has not been initialized. Call LiraLogger.initialize() first.'
      )
    }
    return LiraLogger.#instance
  }

  static debug(...messages: Array<string | unknown>): void {
    const logger = LiraLogger.#getInstance()
    const formattedMessages = logger.#formatMessages(messages)

    if (logger.type === 'debug') {
      logger.#log('debug', ...formattedMessages)
    }
  }

  static error(...messages: Array<string | unknown>): void {
    const logger = LiraLogger.#getInstance()
    const formattedMessages = logger.#formatMessages(messages)
    logger.#log('error', ...formattedMessages)
  }

  static warn(...messages: Array<string | unknown>): void {
    const logger = LiraLogger.#getInstance()
    const formattedMessages = logger.#formatMessages(messages)
    logger.#log('warn', ...formattedMessages)
  }

  #log(type: 'debug' | 'error' | 'warn', ...messages: Array<string>): void {
    if (this.#loggers?.all) {
      return this.#loggers.all(...messages)
    }

    if (this.#loggers?.[type]) {
      return this.#loggers[type]!(...messages)
    }

    return this.#consoleLogger(type, ...messages)
  }

  #formatMessages(messages: Array<string | unknown>): Array<string> {
    return messages.map((message) =>
      typeof message === 'string' ? message : JSON.stringify(message, null, 2)
    )
  }

  #consoleLogger(
    type: 'debug' | 'error' | 'warn',
    ...messages: Array<string | unknown>
  ): void {
    console[type](
      '\x1b[1m\x1b[38;5;153m\x1b[48;5;93m%s\x1b[0m',
      `Lira ${type}:`,
      ...messages
    )
  }
}
