import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import {
  proofreaderApi,
  type ProofreaderAdapter,
  type ProofreaderResult,
  type ProofreaderSession,
} from './proofreader-api'

// Chrome returns corrections as offsets into the text it was given, so the
// result is only meaningful next to the exact input that produced it. Keeping
// them together stops the demo from highlighting positions in edited text.
interface CompletedProofread {
  input: string
  result: ProofreaderResult
}

export function useProofreader(adapter: ProofreaderAdapter = proofreaderApi) {
  const session = useChromeAiSession<ProofreaderSession, CompletedProofread>({
    availability: () => adapter.availability(),
    create: (onDownloadProgress, signal) =>
      adapter.create(onDownloadProgress, signal),
  })

  async function proofread(input: string) {
    await session.run(async (proofreader, signal) => ({
      input,
      result: await proofreader.proofread(input, { signal }),
    }))
  }

  return {
    ...session.state,
    completedProofread: session.result,
    proofread,
    cancel: session.cancel,
  }
}
