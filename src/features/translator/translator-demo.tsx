import { useState } from 'react'

import { primaryButtonClassNames } from '../../components/accent-styles'
import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection, type DemoAccent } from '../../components/demo-section'
import { DemoOutput } from '../../components/demo-output'
import { useTranslator } from './use-translator'

const languages = [
  { code: 'de', name: 'German' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
]

export function TranslatorDemo({ accent }: { accent: DemoAccent }) {
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
      accent={accent}
      eyebrow="API 1"
      title="Translator"
      description="Translate one string with a language-pair-specific model that stays on the device."
      availability={{
        status: 'stable',
        summary: 'Stable since Chrome 138 on desktop.',
      }}
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
              className="focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal focus:ring-4 focus:outline-none"
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
              className="focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 bg-white px-3 py-2 font-normal focus:ring-4 focus:outline-none"
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
            className="focus:border-brand-blue focus:ring-brand-blue/20 min-h-28 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300`}
            disabled={!canRun || !input.trim() || sourceLanguage === targetLanguage}
            type="submit"
          >
            {translator.capability === 'downloadable'
              ? 'Download model and translate'
              : 'Translate'}
          </button>
          {translator.request === 'running' ? (
            <button
              className="border-brand-red text-brand-red hover:bg-brand-red/5 rounded-xl border px-4 py-2 text-sm font-bold"
              type="button"
              onClick={translator.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-5">
        <DemoOutput
          accent={accent}
          request={translator.request}
          output={translator.output}
          error={translator.error}
          emptyMessage="The translated text will appear here."
        />
      </div>
    </DemoSection>
  )
}
