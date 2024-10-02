import { LiraMessageInputStore } from '../input/store/types'
import {
  LiraMessageOutputStore,
  LiraMessageReqTimesStore,
} from '../output/store/types'

export namespace LiraMessage {
  export type TextMessageData = string

  export type Store = {
    input: LiraMessageInputStore
    output?: LiraMessageOutputStore
    reqTime?: LiraMessageReqTimesStore
    error?: unknown
  }
}
