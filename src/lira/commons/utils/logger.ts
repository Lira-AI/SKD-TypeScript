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

  static async debug(...messages: Array<string | unknown>): Promise<void> {
    const logger = LiraLogger.#getInstance()
    const formattedMessage = logger.#formatMessages(messages)

    if (logger.type === 'debug') {
      return logger.#log('debug', formattedMessage)
    }

    return
  }

  static async error(...messages: Array<string | unknown>): Promise<void> {
    const logger = LiraLogger.#getInstance()
    const formattedMessage = logger.#formatMessages(messages)
    return logger.#log('error', formattedMessage)
  }

  static async warn(...messages: Array<string | unknown>): Promise<void> {
    const logger = LiraLogger.#getInstance()
    const formattedMessage = logger.#formatMessages(messages)
    return logger.#log('warn', formattedMessage)
  }

  async #log(type: 'debug' | 'error' | 'warn', message: string): Promise<void> {
    if (this.#loggers?.all) {
      return this.#loggers.all(message)
    }

    if (this.#loggers?.[type]) {
      return this.#loggers[type]!(message)
    }

    return this.#consoleLogger(type, message)
  }

  #formatMessages(messages: Array<string | unknown>): string {
    return messages
      .map((message) =>
        typeof message === 'string' ? message : JSON.stringify(message, null, 2)
      )
      .join(' ')
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
