import { LiraInstanceParams } from '..'
import { StoreAnthropic } from './methods/anthropic/anthropic'
import { StoreCustom } from './methods/custom/custom'
import { StoreOpenAI } from './methods/openai/openai'

export class Store {
  public anthropic: StoreAnthropic

  public custom: StoreCustom

  public openai: StoreOpenAI

  constructor(
    private readonly store: LiraInstanceParams['store'],
    private readonly liraAPIKey?: string
  ) {
    this.anthropic = new StoreAnthropic(this.store, this.liraAPIKey)
    this.openai = new StoreOpenAI(this.store, this.liraAPIKey)
    this.custom = new StoreCustom(this.store, this.liraAPIKey)
  }
}
