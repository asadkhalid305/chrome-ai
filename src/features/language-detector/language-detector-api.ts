import {
  readBrowserApi,
  withDownloadMonitor,
} from '../../chrome-ai/browser-globals'

export type DetectionResult = Pick<
  LanguageDetectionResult,
  'detectedLanguage' | 'confidence'
>

export type LanguageDetectorSession = Pick<
  LanguageDetector,
  'detect' | 'destroy'
>

export interface LanguageDetectorAdapter {
  availability(): Promise<Availability>
  create(
    onDownloadProgress: (progress: number) => void,
    signal?: AbortSignal,
  ): Promise<LanguageDetectorSession>
}

type LanguageDetectorFactory = Pick<
  typeof LanguageDetector,
  'availability' | 'create'
>

const browserLanguageDetector = () =>
  readBrowserApi<LanguageDetectorFactory>('LanguageDetector')

export const languageDetectorApi: LanguageDetectorAdapter = {
  async availability() {
    const factory = browserLanguageDetector()
    // This API takes no create options, so availability needs no arguments.
    return factory ? factory.availability() : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserLanguageDetector()
    if (!factory) {
      throw new Error(
        'The Language Detector API is not available in this browser.',
      )
    }

    return factory.create(withDownloadMonitor({ signal }, onDownloadProgress))
  },
}
