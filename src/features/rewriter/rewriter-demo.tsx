import { useState } from 'react'

import { writingAssistanceFlags } from '../../components/api-availability'
import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { LessonOutput } from '../../components/lesson-output'
import { type RewriteChange } from './rewriter-api'
import { useRewriter } from './use-rewriter'

const sampleText =
  'Hey everyone, we are doing a browser AI workshop next week and it would be really great if you could come along.'

export function RewriterDemo() {
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
      accent="yellow"
      eyebrow="Lesson 6"
      title="Rewriter"
      description="Transform existing English text by one visible tone or length choice while preserving the original."
      availability={{
        status: 'developer-trial',
        summary: 'Developer trial in Chrome 137–148.',
        flags: writingAssistanceFlags,
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
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Original text
          <textarea
            className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-32 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <label className="grid max-w-sm gap-2 text-sm font-semibold text-slate-800">
          Requested change
          <select
            className="focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal focus:ring-4 focus:outline-none"
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
            className="bg-brand-yellow hover:bg-brand-yellow/85 rounded-xl px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"
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
              className="border-brand-red text-brand-red hover:bg-brand-red/5 rounded-xl border px-4 py-2 text-sm font-bold"
              type="button"
              onClick={rewriter.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <LessonOutput
          accent="yellow"
          request={rewriter.request}
          output={rewriter.output}
          error={rewriter.error}
          emptyMessage="The rewritten alternative will appear here. Your original stays above."
        />
      </div>
    </DemoSection>
  )
}
