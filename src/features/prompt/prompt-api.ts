import {
  readBrowserApi,
  withDownloadMonitor,
} from '../../chrome-ai/browser-globals'

export const promptModelOptions = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
} as const satisfies LanguageModelCreateCoreOptions

// Unlike the task-specific APIs, the Prompt API has no built-in job, so the
// demo's instruction lives here as the session's system prompt. Chrome only
// accepts the system role in first position, which the tuple type enforces.
const initialPrompts: [LanguageModelSystemMessage] = [
  {
    role: 'system',
    content:
      'Explain browser AI concepts clearly in no more than three short sentences.',
  },
]

export type PromptSession = Pick<LanguageModel, 'prompt' | 'destroy'>

export interface PromptAdapter {
  availability(): Promise<Availability>
  create(
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<PromptSession>
}

type LanguageModelFactory = Pick<
  typeof LanguageModel,
  'availability' | 'create'
>

const browserLanguageModel = () =>
  readBrowserApi<LanguageModelFactory>('LanguageModel')

export const promptApi: PromptAdapter = {
  async availability() {
    const factory = browserLanguageModel()
    return factory ? factory.availability(promptModelOptions) : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserLanguageModel()
    if (!factory) {
      throw new Error('The Prompt API is not available in this browser.')
    }

    return factory.create(
      withDownloadMonitor(
        { ...promptModelOptions, signal, initialPrompts },
        onDownloadProgress,
      ),
    )
  },
}
