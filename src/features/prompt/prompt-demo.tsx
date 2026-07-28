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
import { usePrompt } from './use-prompt'

// The bat-and-ball puzzle: everyone in the room can follow it, almost everyone
// answers 10 cents, and the right answer needs an actual step of arithmetic. A
// small on-device model is genuinely at risk of falling for it, which is a more
// honest thing to show than a definition it can recite.
const samplePrompt = `A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much does the ball cost?`

export function PromptDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(samplePrompt)
  const promptModel = usePrompt()
  const canRun =
    promptModel.request !== 'running' &&
    (promptModel.capability === 'ready' ||
      promptModel.capability === 'downloadable' ||
      promptModel.capability === 'downloading')

  return (
    <DemoSection
      accent={accent}
      eyebrow="API 4"
      title="Prompt"
      description="Give a small general-purpose language model a question it has to reason about, and watch the system instruction shape how the answer arrives."
      availability={{
        status: 'stable',
        summary: 'Stable on the web since Chrome 148.',
      }}
      codePath="prompt-api.ts → use-prompt.ts → prompt-demo.tsx"
      lifecycleNote="The system instruction is set at session creation. The hook keeps conversational context during this demo and destroys the session on cleanup."
    >
      <CapabilityStatus
        capability={promptModel.capability}
        downloadProgress={promptModel.downloadProgress}
      />

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void promptModel.prompt(input)
        }}
      >
        <label className={fieldLabelClassNames}>
          English prompt
          <textarea
            className={`${textFieldClassNames} min-h-28`}
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
            {promptModel.capability === 'downloadable' ||
            promptModel.capability === 'downloading'
              ? 'Download model and ask'
              : 'Ask the model'}
          </button>
          {promptModel.request === 'running' ? (
            <button
              className={cancelButtonClassNames}
              type="button"
              onClick={promptModel.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <DemoOutput
          accent={accent}
          request={promptModel.request}
          output={promptModel.output}
          error={promptModel.error}
          emptyMessage="The model's plain-text answer will appear here."
        />
      </div>
    </DemoSection>
  )
}
