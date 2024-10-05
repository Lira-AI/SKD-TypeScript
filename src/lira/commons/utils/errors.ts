export class LiraError extends Error {
  constructor(...messages: Array<string>) {
    super(messages.join(' '))
    this.name = 'Lira'
  }
}
