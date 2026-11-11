import { useState } from 'react'

import { writerFlags } from '../../components/api-availability'
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
import { useWriter } from './use-writer'

// The idea says what document to produce; the context supplies the facts it may
// use. Several of these facts are specific enough to check, and the last line is
// deliberately open so the learner can see whether the draft invents a date.
const sampleIdea =
  'Announce an internal pilot of the on-device draft assistant and ask the design and support teams to join it.'
const sampleContext = `The pilot runs from 3 to 14 August. It needs supported desktop Chrome with the experimental Writer API enabled. Drafts are generated on the device, so nothing is sent to a server. Each team gets two 30-minute slots, booked in the shared calendar. Feedback goes in the #draft-pilot channel by 15 August. Pricing and the public launch date are still undecided.`

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
        summary: 'Developer trial. Previous origin trial: Chrome 137–148.',
        flags: writerFlags,
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
        <label className={fieldLabelClassNames}>
          Writing idea
          <textarea
            className={`${textFieldClassNames} min-h-28`}
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
          />
        </label>
        <label className={fieldLabelClassNames}>
          Optional context
          <textarea
            className={`${textFieldClassNames} min-h-32`}
            value={context}
            onChange={(event) => setContext(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames}`}
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
              className={cancelButtonClassNames}
              type="button"
              onClick={writer.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <DemoOutput
          accent={accent}
          capability={writer.capability}
          request={writer.request}
          output={writer.draft}
          error={writer.error}
          emptyMessage="Your generated draft will appear here."
          editor={{
            label: 'Editable generated draft',
            onChange: writer.setDraft,
          }}
        />
      </div>
    </DemoSection>
  )
}
