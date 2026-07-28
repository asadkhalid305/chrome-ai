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

// Chrome closes the ranked list with a residual entry holding the confidence it
// did not assign to any named language. It arrives as "und" or "root", so the
// demo names that row instead of printing a code that reads like a bug.
const residualLanguageCodes = new Set(['und', 'root', 'zxx'])

function languageLabel(code: string) {
  if (residualLanguageCodes.has(code)) {
    return 'Not identified'
  }
  return languageNames.of(code) ?? code
}

// A line typed into a form: too short and too name-like for the detector to
// commit, which is where a ranked list earns its place. A full clean sentence
// scores one language above 99% and teaches nothing about confidence.
const sampleText = 'Hotel Central, 12 Avenida Bolivar, 3B'

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
                      {languageLabel(language)}
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
        Confidence spreads when the evidence is thin, not when languages are
        mixed: this API labels the whole input, so a sentence that switches
        language still resolves to whichever one dominates. Paste a full,
        single-language sentence to watch the top candidate pass 99%.
      </p>
    </DemoSection>
  )
}
