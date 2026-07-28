import { useState } from 'react'

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
import { useSummarizer } from './use-summarizer'

// Real summarization input is uneven: decisions and owners sit next to a room
// mix-up and an argument nobody settled. A short key-points summary has to drop
// the noise, so the learner can judge the output instead of admiring it.
const sampleNotes = `Notes from the Thursday release review. Twelve people attended, and three joined late because the invite listed the wrong room.

Dana walked through the on-device translation rollout. The first-run model download is the loudest complaint in the beta feedback: people assume the page is broken while nothing visible happens. Priya proposed replacing the spinner with byte-level progress, and the group agreed to ship that in 2.4 even though it pushes the offline history view to 2.5.

Marco raised the storage question again. Laptops with 8 GB of RAM sometimes fail the availability check after a browser update, but nobody could reproduce it on demand, so he will collect traces for two weeks before we change anything.

We then spent ten minutes arguing about renaming the feature and reached no decision. Support wants a help-centre article before 2.4 ships, and Priya owns it. Open question for next week: keep the beta flag after the progress indicator lands, or enable it for everyone in Europe first?`

export function SummarizerDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(sampleNotes)
  const summarizer = useSummarizer()
  const canRun =
    summarizer.request !== 'running' &&
    (summarizer.capability === 'ready' ||
      summarizer.capability === 'downloadable' ||
      summarizer.capability === 'downloading')

  return (
    <DemoSection
      accent={accent}
      eyebrow="API 3"
      title="Summarizer"
      description="Turn a longer English passage into short, plain-text key points with a reusable task session."
      availability={{
        status: 'stable',
        summary: 'Stable since Chrome 138 on desktop.',
      }}
      codePath="summarizer-api.ts → use-summarizer.ts → summarizer-demo.tsx"
      lifecycleNote="The options are fixed in the adapter for this demo. The hook reuses one summarizer and destroys it when the demo unmounts."
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
        <label className={fieldLabelClassNames}>
          English source text
          <textarea
            className={`${textFieldClassNames} min-h-60`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames}`}
            disabled={!canRun || !input.trim()}
            type="submit"
          >
            {summarizer.capability === 'downloadable' ||
            summarizer.capability === 'downloading'
              ? 'Download model and summarize'
              : 'Summarize'}
          </button>
          {summarizer.request === 'running' ? (
            <button
              className={cancelButtonClassNames}
              type="button"
              onClick={summarizer.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <DemoOutput
          accent={accent}
          request={summarizer.request}
          output={summarizer.output}
          error={summarizer.error}
          emptyMessage="The short key-point summary will appear here."
        />
      </div>
    </DemoSection>
  )
}
