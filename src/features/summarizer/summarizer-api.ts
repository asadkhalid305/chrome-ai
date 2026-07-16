export const summarizerOptions = {
  type: 'key-points',
  format: 'plain-text',
  length: 'short',
  expectedInputLanguages: ['en'],
  outputLanguage: 'en',
} as const satisfies SummarizerCreateCoreOptions

export type SummarizerSession = Pick<Summarizer, 'summarize' | 'destroy'>

export interface SummarizerAdapter {
  availability(): Promise<Availability>
  create(
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<SummarizerSession>
}

type SummarizerFactory = Pick<typeof Summarizer, 'availability' | 'create'>

function browserSummarizer(): SummarizerFactory | undefined {
  return (globalThis as typeof globalThis & { Summarizer?: SummarizerFactory })
    .Summarizer
}

export const summarizerApi: SummarizerAdapter = {
  async availability() {
    const factory = browserSummarizer()
    return factory
      ? factory.availability(summarizerOptions)
      : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserSummarizer()
    if (!factory) {
      throw new Error('The Summarizer API is not available in this browser.')
    }

    return factory.create({
      ...summarizerOptions,
      signal,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          onDownloadProgress(event.loaded)
        })
      },
    })
  },
}
