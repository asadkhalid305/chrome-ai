import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import { writerApi, type WriterAdapter, type WriterSession } from './writer-api'

export function useWriter(adapter: WriterAdapter = writerApi) {
  const session = useChromeAiSession<WriterSession, string>({
    availability: () => adapter.availability(),
    create: (onDownloadProgress, signal) =>
      adapter.create(onDownloadProgress, signal),
    // The draft is an editable textarea, so a new request must not wipe out
    // whatever the user has already typed into it.
    keepPreviousResult: true,
  })

  async function write(idea: string, context: string) {
    await session.run((writer, signal) =>
      writer.write(idea, {
        // Chrome rejects an empty context string, so omit it entirely instead.
        context: context.trim() || undefined,
        signal,
      }),
    )
  }

  return {
    ...session.state,
    draft: session.result ?? '',
    setDraft: session.setResult,
    write,
    cancel: session.cancel,
  }
}
