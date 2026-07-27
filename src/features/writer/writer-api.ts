import {
  readBrowserApi,
  withDownloadMonitor,
} from '../../chrome-ai/browser-globals'

export const writerOptions = {
  tone: 'casual',
  format: 'plain-text',
  length: 'medium',
  expectedInputLanguages: ['en'],
  expectedContextLanguages: ['en'],
  outputLanguage: 'en',
} as const satisfies WriterCreateCoreOptions

export type WriterSession = Pick<Writer, 'write' | 'destroy'>

export interface WriterAdapter {
  availability(): Promise<Availability>
  create(
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<WriterSession>
}

type WriterFactory = Pick<typeof Writer, 'availability' | 'create'>

const browserWriter = () => readBrowserApi<WriterFactory>('Writer')

export const writerApi: WriterAdapter = {
  async availability() {
    const factory = browserWriter()
    return factory ? factory.availability(writerOptions) : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserWriter()
    if (!factory) {
      throw new Error('The Writer API is not available in this browser.')
    }

    return factory.create(
      withDownloadMonitor({ ...writerOptions, signal }, onDownloadProgress),
    )
  },
}
