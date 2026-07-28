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
import { CorrectionCard } from './correction-card'
import { useProofreader } from './use-proofreader'

// Each mistake is a short, self-contained span: a lowercase "i", a misspelling,
// a wrong article, an uncapitalised acronym, a plural verb, and a homophone.
// Overlapping errors make the API return one confusing multi-word range, so this
// text keeps them apart and the returned offsets stay easy to follow.
const sampleText = `Yesterday i recieved a email about the new browser api. We was suprised that the model only download once, and we didnt notice any delay on there second run.`

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
      description="See where Chrome would fix English grammar, spelling, and punctuation. Each correction is a character range in the text you submitted, so nothing is rewritten behind your back."
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
              <div>
                <h3 className="text-sm font-bold text-white">
                  {completedResult.corrections.length} correction
                  {completedResult.corrections.length === 1 ? '' : 's'}, each a
                  range in the text you submitted
                </h3>
                <ol className="mt-2 grid gap-3">
                  {completedResult.corrections.map((correction, index) => (
                    <CorrectionCard
                      correction={correction}
                      input={completedInput}
                      key={`${correction.startIndex}-${correction.endIndex}-${index}`}
                    />
                  ))}
                </ol>
              </div>
              {completedResult.corrections.every(
                (correction) => !correction.types?.length,
              ) ? (
                <p className="text-sm text-slate-400">
                  No categories or explanations came back. Chrome's current
                  developer-trial implementation returns positions and
                  replacements only: the specified{' '}
                  <code>includeCorrectionTypes</code> and{' '}
                  <code>includeCorrectionExplanations</code> options are not
                  implemented yet, so this list shows everything the browser
                  actually sent.
                </p>
              ) : null}
            </div>
          ) : null}
        </OutputPanel>
      </div>
    </DemoSection>
  )
}
