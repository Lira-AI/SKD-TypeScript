export class LiraError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'Lira'
  }
}
