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

function browserTranslator(): TranslatorFactory | undefined {
  return (globalThis as typeof globalThis & { Translator?: TranslatorFactory })
    .Translator
}

export const translatorApi: TranslatorAdapter = {
  async availability(options) {
    const factory = browserTranslator()
    return factory ? factory.availability(options) : 'unavailable'
  },

  async create(options, onDownloadProgress, signal) {
    const factory = browserTranslator()
    if (!factory) {
      throw new Error('The Translator API is not available in this browser.')
    }

    return factory.create({
      ...options,
      signal,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          onDownloadProgress(event.loaded)
        })
      },
    })
  },
}
