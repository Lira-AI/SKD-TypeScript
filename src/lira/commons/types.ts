export namespace LiraCommons {
  export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
  }

  /**
   * Logger type is used to determine the type of logging that should be used.
   * @debug - Logs the request and response data from the underlying provider.
   * @warn - Logs warnings
   */
  export type Logger = 'prod' | 'debug'

  type LogCallback = (...messages: Array<string>) => void

  type ExcludeOthers = {
    all: LogCallback
    debug?: never
    warn?: never
    error?: never
  }

  type IndividualLoggers = {
    all?: never
    debug?: LogCallback
    warn?: LogCallback
    error?: LogCallback
  }

  export type LoggerConfig = ExcludeOthers | IndividualLoggers
}
