import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import {
  translatorApi,
  type TranslatorAdapter,
  type TranslatorOptions,
  type TranslatorSession,
} from './translator-api'

export function useTranslator(
  options: TranslatorOptions,
  adapter: TranslatorAdapter = translatorApi,
) {
  const session = useChromeAiSession<TranslatorSession, string>({
    availability: () => adapter.availability(options),
    create: (onDownloadProgress, signal) =>
      adapter.create(options, onDownloadProgress, signal),
    // Each language pair is a different downloadable model, so switching pairs
    // has to re-probe availability and start over rather than reuse a session
    // trained on the old pair.
    resetKey: `${options.sourceLanguage}-${options.targetLanguage}`,
  })

  async function translate(input: string) {
    await session.run((translator, signal) =>
      translator.translate(input, { signal }),
    )
  }

  return {
    ...session.state,
    output: session.result ?? '',
    translate,
    cancel: session.cancel,
  }
}
