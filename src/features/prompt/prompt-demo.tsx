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

export function PromptDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(
    'Why should a web app destroy a browser AI session when it is finished?',
  )
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
      description="Ask a small general-purpose language model for a concise explanation, with a visible session and cancelable request."
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
