import { useState } from 'react'

import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { LessonOutput } from '../../components/lesson-output'
import { useTranslator } from './use-translator'

const languages = [
  { code: 'de', name: 'German' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
]

export function TranslatorDemo() {
  const [sourceLanguage, setSourceLanguage] = useState('de')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [input, setInput] = useState(
    'Browser-KI kann Texte direkt auf deinem Gerät übersetzen.',
  )
  const translator = useTranslator({ sourceLanguage, targetLanguage })
  const canRun =
    translator.request !== 'running' &&
    (translator.capability === 'ready' ||
      translator.capability === 'downloadable')

  return (
    <DemoSection
      eyebrow="Lesson 1 · Stable"
      title="Translator"
      description="Translate one string with a language-pair-specific model that stays on the device."
      codePath="translator-api.ts → use-translator.ts → translator-demo.tsx"
      lifecycleNote="Changing the language pair destroys the old translator. Unmounting cancels work and destroys the current session."
    >
      <CapabilityStatus
        capability={translator.capability}
        downloadProgress={translator.downloadProgress}
      />

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void translator.translate(input)
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Source language
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal"
              value={sourceLanguage}
              onChange={(event) => setSourceLanguage(event.target.value)}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Target language
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal"
              value={targetLanguage}
              onChange={(event) => setTargetLanguage(event.target.value)}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Text to translate
          <textarea
            className="min-h-28 rounded-xl border border-slate-300 px-3 py-2 font-normal"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canRun || !input.trim() || sourceLanguage === targetLanguage}
            type="submit"
          >
            {translator.capability === 'downloadable'
              ? 'Download model and translate'
              : 'Translate'}
          </button>
          {translator.request === 'running' ? (
            <button
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800"
              type="button"
              onClick={translator.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <LessonOutput
          request={translator.request}
          output={translator.output}
          error={translator.error}
          emptyMessage="The translated text will appear here."
        />
      </div>
    </DemoSection>
  )
}
