import { useState } from 'react'

import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { LessonOutput } from '../../components/lesson-output'
import { usePrompt } from './use-prompt'

export function PromptDemo() {
  const [input, setInput] = useState(
    'Why should a web app destroy a browser AI session when it is finished?',
  )
  const promptModel = usePrompt()
  const canRun =
    promptModel.request !== 'running' &&
    (promptModel.capability === 'ready' ||
      promptModel.capability === 'downloadable')

  return (
    <DemoSection
      accent="blue"
      eyebrow="Lesson 4 · Stable from Chrome 148 on the web"
      title="Prompt / LanguageModel"
      description="Ask a small general-purpose language model for a concise explanation, with a visible session and cancelable request."
      codePath="prompt-api.ts → use-prompt.ts → prompt-demo.tsx"
      lifecycleNote="The system instruction is set at session creation. The hook keeps conversational context during this lesson and destroys the session on cleanup."
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
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          English prompt
          <textarea
            className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-28 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className="bg-brand-blue hover:bg-brand-blue/85 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canRun || !input.trim()}
            type="submit"
          >
            {promptModel.capability === 'downloadable'
              ? 'Download model and ask'
              : 'Ask the model'}
          </button>
          {promptModel.request === 'running' ? (
            <button
              className="border-brand-red text-brand-red hover:bg-brand-red/5 rounded-xl border px-4 py-2 text-sm font-bold"
              type="button"
              onClick={promptModel.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <LessonOutput
          accent="blue"
          request={promptModel.request}
          output={promptModel.output}
          error={promptModel.error}
          emptyMessage="The model's plain-text answer will appear here."
        />
      </div>
    </DemoSection>
  )
}
