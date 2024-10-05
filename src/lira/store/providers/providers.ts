import { Lira } from '@lira/index'
import { StoreAnthropic } from './anthropic/anthropic'
import { StoreOpenAI } from './openai/openai'

export class Providers {
  public anthropic: StoreAnthropic

  public openai: StoreOpenAI

  constructor(private readonly lira: Lira) {
    this.anthropic = new StoreAnthropic(this.lira)
    this.openai = new StoreOpenAI(this.lira)
  }
}
