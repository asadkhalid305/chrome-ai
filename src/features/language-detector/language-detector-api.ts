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

function browserLanguageDetector(): LanguageDetectorFactory | undefined {
  return (
    globalThis as typeof globalThis & {
      LanguageDetector?: LanguageDetectorFactory
    }
  ).LanguageDetector
}

export const languageDetectorApi: LanguageDetectorAdapter = {
  async availability() {
    const factory = browserLanguageDetector()
    return factory ? factory.availability() : 'unavailable'
  },

  async create(onDownloadProgress, signal) {
    const factory = browserLanguageDetector()
    if (!factory) {
      throw new Error('The Language Detector API is not available in this browser.')
    }

    return factory.create({
      signal,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => {
          onDownloadProgress(event.loaded)
        })
      },
    })
  },
}
