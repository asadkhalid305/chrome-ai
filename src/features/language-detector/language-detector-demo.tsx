import { useState } from 'react'

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
import { useLanguageDetector } from './use-language-detector'

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

// One message that switches language four times, the way a multilingual team
// chat actually reads. No single label is correct, so the detector has to spread
// its confidence — which is why this API returns a ranked list at all.
const sampleText =
  'Hola equipo, ich schicke euch das Update heute Abend, and then we can review it together demain matin.'

export function LanguageDetectorDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(sampleText)
  const detector = useLanguageDetector()
  const canRun =
    detector.request !== 'running' &&
    (detector.capability === 'ready' ||
      detector.capability === 'downloadable' ||
      detector.capability === 'downloading')

  return (
    <DemoSection
      accent={accent}
      eyebrow="API 2"
      title="Language Detector"
      description="Inspect ranked language candidates and their confidence before deciding what to do with user text."
      availability={{
        status: 'stable',
        summary: 'Stable since Chrome 138 on desktop.',
      }}
      codePath="language-detector-api.ts → use-language-detector.ts → language-detector-demo.tsx"
      lifecycleNote="The hook reuses one detector for repeated checks, aborts the active request on cancel, and destroys the detector on cleanup."
    >
      <CapabilityStatus
        capability={detector.capability}
        downloadProgress={detector.downloadProgress}
      />

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void detector.detect(input)
        }}
      >
        <label className={fieldLabelClassNames}>
          Text to inspect
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
            {detector.capability === 'downloadable' ||
            detector.capability === 'downloading'
              ? 'Download model and detect'
              : 'Detect language'}
          </button>
          {detector.request === 'running' ? (
            <button
              className={cancelButtonClassNames}
              type="button"
              onClick={detector.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <OutputPanel accent={accent}>
          {detector.request === 'idle' ? (
            <p className="text-slate-400">Ranked candidates will appear here.</p>
          ) : null}
          {detector.request === 'running' ? <p>Running on your device…</p> : null}
          {detector.request === 'canceled' ? <p>Request canceled.</p> : null}
          {detector.request === 'error' ? (
            <p className="text-brand-red">{detector.error}</p>
          ) : null}
          {detector.request === 'success' ? (
            <ol className="grid gap-3">
              {detector.results.slice(0, 3).map((result, index) => {
                const language = result.detectedLanguage ?? 'und'
                const confidence = result.confidence ?? 0
                return (
                  <li
                    className="flex items-center justify-between gap-4"
                    key={`${language}-${index}`}
                  >
                    <span className="font-semibold text-slate-100">
                      {languageNames.of(language) ?? language}
                    </span>
                    <span className="font-mono text-slate-300">
                      {(confidence * 100).toFixed(1)}%
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : null}
        </OutputPanel>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        The seeded message mixes Spanish, German, English, and French, so no
        candidate can win outright. Replace it with one language to watch the
        ranking collapse onto a single result, or with one word to watch every
        score weaken.
      </p>
    </DemoSection>
  )
}
