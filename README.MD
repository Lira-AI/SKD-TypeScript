# Getting started

Go to the Official Documentation for a complete guide
[Docs](https://docs.lira-ai.com)

## Installation

```bash
# yarn
yarn add lira

# pnpm
pnpm add lira

# npm
npm install lira
```

## Prerequisites

Make sure to install the SDK of the providers you want to use:

```bash
# yarn
yarn add openai
yarn add @anthropic-ai/sdk

# pnpm
pnpm add openai
pnpm add @anthropic-ai/sdk

# npm
npm install openai
npm install @anthropic-ai/sdk
```

## Lira instance

Create an instance of the `Lira` class

```ts
import { Lira } from 'lira'
const lira = new Lira()
```

### Options

The `Lira` constructor accepts an options object with the following properties:

#### keys

Set the API keys for the providers you want to use

- `anthropic` (string): Anthropic API key
- `openai` (string): OpenAI API key

#### store

Options to configure the storing of the messages.

- `enabled` (boolean, default: false): Set to `true` to enable the storing of the messages.
- `callback` ((params: LiraMessageStore) => unknown, required): Your custom callback to store the entire message object. The callback receives the following object as `params`:

  ```typescript
  {
    input: LiraMessageInputStore
    output?: LiraMessageOutputStore
    reqTime?: LiraMessageReqTimesStore
    error?: unknown
  }
  ```

#### loggers

Configure the way Lira logs messages

- `type` ("prod" | "debug", default: "prod"): Set to `debug` to enable the debug mode and see raw requests and responses to the providers
- `config` (object, default: console.log()): Setting a custom callback lets you log the messages with your own monitoring system.
  - `all` ((...messages: Array<string>) => void): Callback to log all messages (will override the other callbacks)
  - `debug` ((...messages: Array<string>) => void): Callback to log debug messages
  - `warn` ((...messages: Array<string>) => void): Callback to log warn messages
  - `error` ((...messages: Array<string>) => void): Callback to log error messages
