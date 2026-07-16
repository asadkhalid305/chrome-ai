import type { RequestState } from '../chrome-ai/shared-types'

interface LessonOutputProps {
  request: RequestState
  output: string
  error: string | null
  emptyMessage: string
}

export function LessonOutput({
  request,
  output,
  error,
  emptyMessage,
}: LessonOutputProps) {
  return (
    <div
      className="min-h-28 rounded-xl border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100"
      aria-live="polite"
    >
      {request === 'running' ? <p>Running on your device…</p> : null}
      {request === 'canceled' ? <p>Request canceled.</p> : null}
      {request === 'error' ? <p className="text-red-300">{error}</p> : null}
      {request === 'success' ? (
        <pre className="whitespace-pre-wrap font-sans">{output}</pre>
      ) : null}
      {request === 'idle' ? <p className="text-slate-400">{emptyMessage}</p> : null}
    </div>
  )
}
