import { useState } from 'react'

import { rewriterFlags } from '../../components/api-availability'
import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { DemoOutput } from '../../components/demo-output'
import { primaryButtonClassNames, type DemoAccent } from '../../theme/accent'
import {
  cancelButtonClassNames,
  fieldLabelClassNames,
  primaryButtonShellClassNames,
  textFieldClassNames,
} from '../../theme/field-styles'
import { type RewriteChange } from './rewriter-api'
import { useRewriter } from './use-rewriter'

// Informal register plus checkable facts makes every option visibly different:
// the formal rewrite has something to lift, the shorter one something to cut,
// and all four have a date, a time, a room, a seat count, and a version to keep.
const sampleText = `hey all — quick one before the weekend: the browser AI workshop is on Thursday the 14th at 18:30 in the small meeting room on floor 3, and it would be a shame if nobody showed up since we only managed to get 12 seats. bring a laptop with Chrome 141 or newer if you have one, otherwise just pair with someone. no prep needed, we'll do everything live.`

export function RewriterDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(sampleText)
  const [change, setChange] = useState<RewriteChange>('more-formal')
  const rewriter = useRewriter()
  const canRun =
    rewriter.request !== 'running' &&
    (rewriter.capability === 'ready' ||
      rewriter.capability === 'downloadable' ||
      rewriter.capability === 'downloading')

  return (
    <DemoSection
      accent={accent}
      eyebrow="API 6"
      title="Rewriter"
      description="Transform existing English text by one visible tone or length choice while preserving the original."
      availability={{
        status: 'developer-trial',
        summary: 'Developer trial in Chrome 137–148.',
        flags: rewriterFlags,
      }}
      codePath="rewriter-api.ts → use-rewriter.ts → rewriter-demo.tsx"
      lifecycleNote="Tone and length are immutable session options. The hook destroys the old rewriter before creating one for a different change."
    >
      <CapabilityStatus
        capability={rewriter.capability}
        downloadProgress={rewriter.downloadProgress}
      />

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void rewriter.rewrite(input, change)
        }}
      >
        <label className={fieldLabelClassNames}>
          Original text
          <textarea
            className={`${textFieldClassNames} min-h-32`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <label className={`${fieldLabelClassNames} max-w-sm`}>
          Requested change
          <select
            className={`${textFieldClassNames} bg-white`}
            value={change}
            onChange={(event) =>
              setChange(event.target.value as RewriteChange)
            }
          >
            <option value="more-formal">Use a more formal tone</option>
            <option value="more-casual">Use a more casual tone</option>
            <option value="shorter">Make it shorter</option>
            <option value="longer">Make it longer</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames}`}
            disabled={!canRun || !input.trim()}
            type="submit"
          >
            {rewriter.capability === 'downloadable' ||
            rewriter.capability === 'downloading'
              ? 'Download model and rewrite'
              : 'Rewrite separately'}
          </button>
          {rewriter.request === 'running' ? (
            <button
              className={cancelButtonClassNames}
              type="button"
              onClick={rewriter.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <DemoOutput
          accent={accent}
          request={rewriter.request}
          output={rewriter.output}
          error={rewriter.error}
          emptyMessage="The rewritten alternative will appear here. Your original stays above."
        />
      </div>
    </DemoSection>
  )
}
