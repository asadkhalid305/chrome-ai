import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import {
  languageDetectorApi,
  type DetectionResult,
  type LanguageDetectorAdapter,
  type LanguageDetectorSession,
} from './language-detector-api'

export function useLanguageDetector(
  adapter: LanguageDetectorAdapter = languageDetectorApi,
) {
  const session = useChromeAiSession<
    LanguageDetectorSession,
    DetectionResult[]
  >({
    availability: () => adapter.availability(),
    create: (onDownloadProgress, signal) =>
      adapter.create(onDownloadProgress, signal),
  })

  async function detect(input: string) {
    // Detection returns every candidate language ranked by confidence, not a
    // single answer, so the demo can show how sure the model is.
    await session.run((detector, signal) => detector.detect(input, { signal }))
  }

  return {
    ...session.state,
    results: session.result ?? [],
    detect,
    cancel: session.cancel,
  }
}
