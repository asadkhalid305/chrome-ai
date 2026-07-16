import { useState } from 'react'

import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { LessonOutput } from '../../components/lesson-output'
import { useSummarizer } from './use-summarizer'

const sampleArticle = `Chrome built-in AI APIs let websites use models supplied by the browser. The work happens on the user's device, so short-lived input does not need to be sent to an application server. Before a site can use an API, it checks availability and may need to ask Chrome to download a model. Downloads can take time, so the interface should show progress and wait for clear user intent. Each API session also consumes resources. Applications should reuse a session when appropriate, cancel work the user no longer wants, and destroy the session during cleanup.`

export function SummarizerDemo() {
  const [input, setInput] = useState(sampleArticle)
  const summarizer = useSummarizer()
  const canRun =
    summarizer.request !== 'running' &&
    (summarizer.capability === 'ready' ||
      summarizer.capability === 'downloadable')

  return (
    <DemoSection
      eyebrow="Lesson 3 · Stable"
      title="Summarizer"
      description="Turn a longer English passage into short, plain-text key points with a reusable task session."
      codePath="summarizer-api.ts → use-summarizer.ts → summarizer-demo.tsx"
      lifecycleNote="The options are fixed in the adapter for this lesson. The hook reuses one summarizer and destroys it when the lesson unmounts."
    >
      <CapabilityStatus
        capability={summarizer.capability}
        downloadProgress={summarizer.downloadProgress}
      />

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void summarizer.summarize(input)
        }}
      >
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          English article
          <textarea
            className="min-h-48 rounded-xl border border-slate-300 px-3 py-2 font-normal"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canRun || !input.trim()}
            type="submit"
          >
            {summarizer.capability === 'downloadable'
              ? 'Download model and summarize'
              : 'Summarize'}
          </button>
          {summarizer.request === 'running' ? (
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800"
              type="button"
              onClick={summarizer.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <LessonOutput
          request={summarizer.request}
          output={summarizer.output}
          error={summarizer.error}
          emptyMessage="The short key-point summary will appear here."
        />
      </div>
    </DemoSection>
  )
}
