import type { ReactNode } from 'react'
import type { DemoState } from '../../chrome-ai/shared-types'
import { CapabilityStatus } from '../../components/capability-status'
import { DemoOutput } from '../../components/demo-output'
import { DemoSection } from '../../components/demo-section'
import type { DemoAccent } from '../../theme/accent'

// Only the surrounding instructions and feedback are shared. Each lesson keeps
// its native calls, form, and submit handler in its own files.
export function WorkshopFrame({
  id,
  title,
  goal,
  accent,
  model,
  children,
}: {
  id: 'summarizer' | 'translator' | 'prompt'
  title: string
  goal: string
  accent: DemoAccent
  model: DemoState & { output: string; partialOutput?: string }
  children: ReactNode
}) {
  return (
    <DemoSection
      accent={accent}
      eyebrow="Hands-on · choose one exercise"
      title={title}
      description={goal}
      availability={{
        status: 'stable',
        summary: 'Check availability on this device before creating a session.',
      }}
      codePath={`src/workshop/exercises/${id}.ts`}
      lifecycleNote="The exercise creates a native session for each request and destroys it in finally. The UI aborts work when you leave this tab."
    >
      <aside className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <p className="font-semibold">Open this file and complete TODOs 1–5:</p>
        <p className="mt-2 break-all font-mono text-xs">{`src/workshop/exercises/${id}.ts`}</p>
        <p>
          Choose one exercise, work alone or pair, and take about 10 minutes. No
          UI changes needed. Read README.md for setup, hints, and the solution
          reference.
        </p>
        <p>
          The starter deliberately stops at missing code. After implementing
          availability, reload this page to check again.
        </p>
        <a
          className="underline"
          href={`https://developer.chrome.com/docs/ai/${
            id === 'prompt' ? 'prompt-api' : `${id}-api`
          }`}
          target="_blank"
          rel="noreferrer"
        >
          Open the official API guide
        </a>
      </aside>
      <CapabilityStatus
        capability={model.capability}
        downloadProgress={model.downloadProgress}
      />
      {model.capability === 'error' && model.request !== 'error' ? (
        <p className="mt-3 text-sm text-brand-red" role="alert">
          {model.error}
        </p>
      ) : null}
      {children}
      <div className="mt-5">
        <DemoOutput
          accent={accent}
          capability={model.capability}
          request={model.request}
          output={model.output}
          partialOutput={model.partialOutput}
          error={model.error}
          emptyMessage="Complete the TODOs, then run your example."
        />
      </div>
    </DemoSection>
  )
}
