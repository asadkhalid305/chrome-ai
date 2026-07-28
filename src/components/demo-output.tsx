import type { RequestState } from '../chrome-ai/shared-types'
import type { DemoAccent } from '../theme/accent'
import { OutputPanel } from './output-panel'

interface DemoOutputProps {
  request: RequestState
  output: string
  error: string | null
  emptyMessage: string
  accent: DemoAccent
}

export function DemoOutput({
  request,
  output,
  error,
  emptyMessage,
  accent,
}: DemoOutputProps) {
  return (
    <OutputPanel accent={accent}>
      {request === 'running' ? <p>Running on your device…</p> : null}
      {request === 'canceled' ? <p>Request canceled.</p> : null}
      {request === 'error' ? <p className="text-brand-red">{error}</p> : null}
      {request === 'success' ? (
        <pre className="whitespace-pre-wrap font-sans">{output}</pre>
      ) : null}
      {request === 'idle' ? <p className="text-slate-400">{emptyMessage}</p> : null}
    </OutputPanel>
  )
}
