import {
  readBrowserApi,
  withDownloadMonitor,
} from '../../chrome-ai/browser-globals'

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

const browserSummarizer = () =>
  readBrowserApi<SummarizerFactory>('Summarizer')

export const summarizerApi: SummarizerAdapter = {
  async availability() {
    const factory = browserSummarizer()
    // Availability depends on the options: the same browser can have one
    // configuration ready and another unavailable.
    return factory ? factory.availability(summarizerOptions) : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserSummarizer()
    if (!factory) {
      throw new Error('The Summarizer API is not available in this browser.')
    }

    return factory.create(
      withDownloadMonitor({ ...summarizerOptions, signal }, onDownloadProgress),
    )
  },
}
