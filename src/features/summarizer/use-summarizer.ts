import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import {
  summarizerApi,
  type SummarizerAdapter,
  type SummarizerSession,
} from './summarizer-api'

export function useSummarizer(adapter: SummarizerAdapter = summarizerApi) {
  const session = useChromeAiSession<SummarizerSession, string>({
    availability: () => adapter.availability(),
    create: (onDownloadProgress, signal) =>
      adapter.create(onDownloadProgress, signal),
  })

  async function summarize(input: string) {
    await session.run((summarizer, signal) =>
      summarizer.summarize(input, {
        // Context tells the model what kind of text it is reading. The fixed
        // type/format/length options live in summarizer-api.ts.
        context: 'This is a short educational article for web developers.',
        signal,
      }),
    )
  }

  return {
    ...session.state,
    output: session.result ?? '',
    summarize,
    cancel: session.cancel,
  }
}
