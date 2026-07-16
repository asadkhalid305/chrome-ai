export const promptModelOptions = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
} as const satisfies LanguageModelCreateCoreOptions

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

function browserLanguageModel(): LanguageModelFactory | undefined {
  return (
    globalThis as typeof globalThis & { LanguageModel?: LanguageModelFactory }
  ).LanguageModel
}

export const promptApi: PromptAdapter = {
  async availability() {
    const factory = browserLanguageModel()
    return factory
      ? factory.availability(promptModelOptions)
      : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserLanguageModel()
    if (!factory) {
      throw new Error('The Prompt API is not available in this browser.')
    }

    return factory.create({
      ...promptModelOptions,
      signal,
      initialPrompts: [
        {
          role: 'system',
          content:
            'Explain browser AI concepts clearly in no more than three short sentences.',
        },
      ],
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          onDownloadProgress(event.loaded)
        })
      },
    })
  },
}
