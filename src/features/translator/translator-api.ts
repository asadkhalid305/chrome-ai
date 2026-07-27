import {
  readBrowserApi,
  withDownloadMonitor,
} from '../../chrome-ai/browser-globals'

export interface TranslatorOptions {
  sourceLanguage: string
  targetLanguage: string
}

export type TranslatorSession = Pick<Translator, 'translate' | 'destroy'>

export interface TranslatorAdapter {
  availability(options: TranslatorOptions): Promise<Availability>
  create(
    options: TranslatorOptions,
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<TranslatorSession>
}

type TranslatorFactory = Pick<typeof Translator, 'availability' | 'create'>

const browserTranslator = () => readBrowserApi<TranslatorFactory>('Translator')

export const translatorApi: TranslatorAdapter = {
  async availability(options) {
    const factory = browserTranslator()
    // Each language pair is a separate model, so availability is per pair.
    return factory ? factory.availability(options) : 'unavailable'
  },

  async create(options, onDownloadProgress, signal) {
    const factory = browserTranslator()
    if (!factory) {
      throw new Error('The Translator API is not available in this browser.')
    }

    return factory.create(
      withDownloadMonitor({ ...options, signal }, onDownloadProgress),
    )
  },
}
