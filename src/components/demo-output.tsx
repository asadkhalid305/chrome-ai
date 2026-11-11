import { useId, type ReactNode } from 'react'
import type { CapabilityState, RequestState } from '../chrome-ai/shared-types'
import type { DemoAccent } from '../theme/accent'
import { outputEditorClassNames } from '../theme/field-styles'
import { OutputPanel } from './output-panel'
import { RequestFeedback } from './request-feedback'

interface DemoOutputProps {
  capability: CapabilityState
  request: RequestState
  output?: string
  // Supplying this field (even empty) selects live output instead of a running message.
  partialOutput?: string
  error: string | null
  emptyMessage: string
  accent: DemoAccent
  children?: ReactNode
  editor?: { label: string; onChange: (value: string) => void }
}

// Every model lesson shares this shell and state feedback; only its result varies.
export function DemoOutput({
  capability,
  request,
  output = '',
  partialOutput,
  error,
  emptyMessage,
  accent,
  children,
  editor,
}: DemoOutputProps) {
  const statusId = useId()
  const running = request === 'running'
  return (
    <OutputPanel accent={accent} busy={partialOutput === undefined && running}>
      <RequestFeedback
        id={statusId}
        capability={capability}
        request={request}
        error={error}
        mode={partialOutput === undefined ? 'batch' : 'streaming'}
      />
      {editor ? (
        <>
          <label className="mt-2 grid gap-2 text-sm font-semibold text-slate-100">
            {editor.label}
            <textarea
              className={outputEditorClassNames}
              disabled={running}
              aria-describedby={running ? statusId : undefined}
              placeholder={emptyMessage}
              value={output}
              onChange={(event) => editor.onChange(event.target.value)}
            />
          </label>
          {request === 'success' ? (
            <p className="mt-2 text-slate-400" role="status">
              Result ready. You can now edit the text.
            </p>
          ) : null}
        </>
      ) : (
        <>
          {request === 'success' ? (
            (children ?? (
              <pre
                className="mt-2 whitespace-pre-wrap font-sans"
                aria-label="Model output"
              >
                {output}
              </pre>
            ))
          ) : partialOutput ? (
            <pre
              className="mt-2 whitespace-pre-wrap font-sans"
              aria-label="Partial model output"
            >
              {partialOutput}
            </pre>
          ) : null}
          {request === 'idle' ? (
            <p className="text-slate-400">{emptyMessage}</p>
          ) : null}
        </>
      )}
    </OutputPanel>
  )
}
