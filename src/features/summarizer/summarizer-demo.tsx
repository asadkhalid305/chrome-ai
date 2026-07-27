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

const sampleArticle = `Built-in browser AI APIs let websites use models supplied by the browser. The work happens on the user's device, so short-lived input does not need to be sent to an application server. Before a site can use an API, it checks availability and may need to ask the browser to download a model. Downloads can take time, so the interface should show progress and wait for clear user intent. Each API session also consumes resources. Applications should reuse a session when appropriate, cancel work the user no longer wants, and destroy the session during cleanup.`

export function SummarizerDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(sampleArticle)
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
          English article
          <textarea
            className={`${textFieldClassNames} min-h-48`}
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
