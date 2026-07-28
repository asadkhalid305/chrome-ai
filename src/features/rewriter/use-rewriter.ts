import { useRef } from 'react'

import { useChromeAiSession } from '../../chrome-ai/use-chrome-ai-session'
import {
  rewriterApi,
  type RewriteChange,
  type RewriterAdapter,
  type RewriterSession,
} from './rewriter-api'

// Availability is probed with the default change because Chrome answers per
// option set, and the demo has to say something before the user picks one.
const defaultChange: RewriteChange = 'more-formal'

export function useRewriter(adapter: RewriterAdapter = rewriterApi) {
  // The change the current session was created with, or null before the first
  // request. A ref rather than state because it is read while creating a session,
  // not while rendering.
  const sessionChangeRef = useRef<RewriteChange | null>(null)

  const session = useChromeAiSession<RewriterSession, string>({
    availability: () => adapter.availability(defaultChange),
    create: (onDownloadProgress, signal) =>
      adapter.create(
        sessionChangeRef.current ?? defaultChange,
        onDownloadProgress,
        signal,
      ),
  })

  async function rewrite(input: string, change: RewriteChange) {
    // Tone and length are fixed when Chrome creates the rewriter, so a different
    // requested change needs a different session. Recording the change before
    // any await keeps two submits for the same change sharing one session.
    const previousChange = sessionChangeRef.current
    sessionChangeRef.current = change
    if (previousChange !== null && previousChange !== change) {
      await session.discardSession()
    }

    await session.run((rewriter, signal) =>
      rewriter.rewrite(input, {
        // Naming the details that must survive gives the shorter and more formal
        // rewrites something to be judged against, since both are free to drop
        // whatever the context does not protect.
        context:
          'Keep the meaning of this message, and keep every date, time, place, number, and version it mentions.',
        signal,
      }),
    )
  }

  return {
    ...session.state,
    output: session.result ?? '',
    rewrite,
    cancel: session.cancel,
  }
}
