import { useState } from 'react'

import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { useLanguageDetector } from './use-language-detector'

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })

export function LanguageDetectorDemo() {
  const [input, setInput] = useState(
    'La inteligencia artificial integrada funciona directamente en el navegador.',
  )
  const detector = useLanguageDetector()
  const canRun =
    detector.request !== 'running' &&
    (detector.capability === 'ready' || detector.capability === 'downloadable')

  return (
    <DemoSection
      eyebrow="Lesson 2 · Stable"
      title="Language Detector"
      description="Inspect ranked language candidates and their confidence before deciding what to do with user text."
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
            className="min-h-28 rounded-xl border border-slate-300 px-3 py-2 font-normal"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canRun || !input.trim()}
            type="submit"
          >
            {detector.capability === 'downloadable'
              ? 'Download model and detect'
              : 'Detect language'}
          </button>
          {detector.request === 'running' ? (
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800"
              type="button"
              onClick={detector.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5 min-h-28 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
        {detector.request === 'idle' ? (
          <p className="text-sm text-slate-500">Ranked candidates will appear here.</p>
        ) : null}
        {detector.request === 'running' ? <p>Running on your device…</p> : null}
        {detector.request === 'canceled' ? <p>Request canceled.</p> : null}
        {detector.request === 'error' ? (
          <p className="text-red-700">{detector.error}</p>
        ) : null}
        {detector.request === 'success' ? (
          <ol className="grid gap-3">
            {detector.results.slice(0, 3).map((result, index) => {
              const language = result.detectedLanguage ?? 'und'
              const confidence = result.confidence ?? 0
              return (
                <li className="flex items-center justify-between gap-4" key={`${language}-${index}`}>
                  <span className="font-semibold text-slate-900">
                    {languageNames.of(language) ?? language}
                  </span>
                  <span className="font-mono text-sm text-slate-600">
                    {(confidence * 100).toFixed(1)}%
                  </span>
                </li>
              )
            })}
          </ol>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Try a full sentence: very short phrases usually produce weaker confidence.
      </p>
    </DemoSection>
  )
}
