import { useState } from 'react'

import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { OutputPanel } from '../../components/output-panel'
import { primaryButtonClassNames, type DemoAccent } from '../../theme/accent'
import { useLanguageDetector } from './use-language-detector'

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

export function LanguageDetectorDemo({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(
    'La inteligencia artificial integrada funciona directamente en el navegador.',
  )
  const detector = useLanguageDetector()
  const canRun =
    detector.request !== 'running' &&
    (detector.capability === 'ready' || detector.capability === 'downloadable')

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
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Text to inspect
          <textarea
            className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-28 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300`}
            disabled={!canRun || !input.trim()}
            type="submit"
          >
            {detector.capability === 'downloadable'
              ? 'Download model and detect'
              : 'Detect language'}
          </button>
          {detector.request === 'running' ? (
            <button
              className="border-brand-red text-brand-red hover:bg-brand-red/5 rounded-xl border px-4 py-2 text-sm font-bold"
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
        Try a full sentence: very short phrases usually produce weaker confidence.
      </p>
    </DemoSection>
  )
}
