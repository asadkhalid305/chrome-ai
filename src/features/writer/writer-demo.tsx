import { useState } from 'react'

import {
  primaryButtonClassNames,
  softBoxClassNames,
} from '../../components/accent-styles'
import { writingAssistanceFlags } from '../../components/api-availability'
import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection, type DemoAccent } from '../../components/demo-section'
import { useWriter } from './use-writer'

const sampleIdea = 'Invite the local web community to a hands-on AI study session.'
const sampleContext =
  'The event is next Thursday at 18:30. It is free, beginner-friendly, and lasts 90 minutes.'

export function WriterDemo({ accent }: { accent: DemoAccent }) {
  const [idea, setIdea] = useState(sampleIdea)
  const [context, setContext] = useState(sampleContext)
  const writer = useWriter()
  const canRun =
    writer.request !== 'running' &&
    (writer.capability === 'ready' ||
      writer.capability === 'downloadable' ||
      writer.capability === 'downloading')

  return (
    <DemoSection
      accent={accent}
      eyebrow="API 5"
      title="Writer"
      description="Create a new, editable English draft from one focused idea and optional context."
      availability={{
        status: 'developer-trial',
        summary: 'Developer trial in Chrome 137–148.',
        flags: writingAssistanceFlags,
      }}
      codePath="writer-api.ts → use-writer.ts → writer-demo.tsx"
      lifecycleNote="The hook reuses one writer with fixed demo options, aborts unwanted work, and destroys the session when this demo unmounts."
    >
      <CapabilityStatus
        capability={writer.capability}
        downloadProgress={writer.downloadProgress}
      />

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void writer.write(idea, context)
        }}
      >
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Writing idea
          <textarea
            className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-28 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Optional context
          <textarea
            className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-24 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
            value={context}
            onChange={(event) => setContext(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300`}
            disabled={!canRun || !idea.trim()}
            type="submit"
          >
            {writer.capability === 'downloadable' ||
            writer.capability === 'downloading'
              ? 'Download model and write'
              : 'Create draft'}
          </button>
          {writer.request === 'running' ? (
            <button
              className="border-brand-red text-brand-red hover:bg-brand-red/5 rounded-xl border px-4 py-2 text-sm font-bold"
              type="button"
              onClick={writer.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className={`mt-5 rounded-2xl border p-4 ${softBoxClassNames[accent]}`}>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Editable generated draft
          <textarea
            className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-40 rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal focus:ring-4 focus:outline-none"
            placeholder={
              writer.request === 'running'
                ? 'Writing on your device…'
                : 'Your generated draft will appear here.'
            }
            value={writer.draft}
            onChange={(event) => writer.setDraft(event.target.value)}
          />
        </label>
        {writer.request === 'canceled' ? (
          <p className="mt-2 text-sm text-slate-600">Request canceled.</p>
        ) : null}
        {writer.request === 'error' ? (
          <p className="text-brand-red mt-2 text-sm">{writer.error}</p>
        ) : null}
      </div>
    </DemoSection>
  )
}
