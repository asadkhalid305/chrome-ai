import { useState } from 'react'

import { proofreaderFlags } from '../../components/api-availability'
import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { OutputPanel } from '../../components/output-panel'
import { primaryButtonClassNames, type DemoAccent } from '../../theme/accent'
import {
  cancelButtonClassNames,
  fieldLabelClassNames,
  primaryButtonShellClassNames,
  textFieldClassNames,
} from '../../theme/field-styles'
import { useProofreader } from './use-proofreader'

// One error per category the result can report — pronoun case, subject-verb
// agreement, a homophone, a missing apostrophe, a wrong verb form, and a
// misspelling — so the correction list arrives with varied types to compare.
const sampleText = `Last week me and my teammate has tested the new browser API on there laptops. We didnt knew that the model downloads only once, so we was suprised when the second run finished instantly.`

export function ProofreaderDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(sampleText)
  const proofreader = useProofreader()
  const canRun =
    proofreader.request !== 'running' &&
    (proofreader.capability === 'ready' ||
      proofreader.capability === 'downloadable' ||
      proofreader.capability === 'downloading')
  const completedResult = proofreader.completedProofread?.result
  const completedInput = proofreader.completedProofread?.input ?? ''

  return (
    <DemoSection
      accent={accent}
      eyebrow="API 7"
      title="Proofreader"
      description="Inspect English grammar, spelling, and punctuation suggestions without silently changing the original text."
      availability={{
        status: 'developer-trial',
        summary: 'Developer trial in Chrome 141–145.',
        flags: proofreaderFlags,
      }}
      codePath="proofreader-api.ts → use-proofreader.ts → proofreader-demo.tsx"
      lifecycleNote="The hook owns one proofreader, aborts the active request, and destroys the session when the demo unmounts."
    >
      <CapabilityStatus
        capability={proofreader.capability}
        downloadProgress={proofreader.downloadProgress}
      />

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void proofreader.proofread(input)
        }}
      >
        <label className={fieldLabelClassNames}>
          Original text
          <textarea
            className={`${textFieldClassNames} min-h-32`}
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
            {proofreader.capability === 'downloadable' ||
            proofreader.capability === 'downloading'
              ? 'Download model and proofread'
              : 'Inspect corrections'}
          </button>
          {proofreader.request === 'running' ? (
            <button
              className={cancelButtonClassNames}
              type="button"
              onClick={proofreader.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <OutputPanel accent={accent}>
          {proofreader.request === 'idle' ? (
            <p className="text-slate-400">
              Suggested corrections will appear here.
            </p>
          ) : null}
          {proofreader.request === 'running' ? (
            <p>Proofreading on your device…</p>
          ) : null}
          {proofreader.request === 'canceled' ? <p>Request canceled.</p> : null}
          {proofreader.request === 'error' ? (
            <p className="text-brand-red">{proofreader.error}</p>
          ) : null}
          {proofreader.request === 'success' &&
          completedResult?.corrections.length === 0 ? (
            <p>No corrections were suggested. The API ran successfully.</p>
          ) : null}
          {proofreader.request === 'success' &&
          completedResult &&
          completedResult.corrections.length > 0 ? (
            <div className="grid gap-5">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Corrected alternative
                </h3>
                <p className="mt-1 whitespace-pre-wrap">
                  {completedResult.correctedInput}
                </p>
              </div>
              <ol className="grid gap-3">
                {completedResult.corrections.map((correction, index) => (
                  <li
                    className="rounded-xl border border-slate-200 bg-white p-3 text-slate-800"
                    key={`${correction.startIndex}-${correction.endIndex}-${index}`}
                  >
                    <p>
                      <span className="font-semibold">Original:</span>{' '}
                      {completedInput.slice(
                        correction.startIndex,
                        correction.endIndex,
                      )}
                    </p>
                    <p>
                      <span className="font-semibold">Suggestion:</span>{' '}
                      {correction.correction}
                    </p>
                    <p>
                      <span className="font-semibold">Category:</span>{' '}
                      {correction.types?.join(', ') ?? 'Not provided'}
                    </p>
                    <p>
                      <span className="font-semibold">Explanation:</span>{' '}
                      {correction.explanation ?? 'Not provided'}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </OutputPanel>
      </div>
    </DemoSection>
  )
}
