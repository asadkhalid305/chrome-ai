import { useState } from 'react'

import { CapabilityStatus } from '../../components/capability-status'
import { DemoSection } from '../../components/demo-section'
import { DemoOutput } from '../../components/demo-output'
import { primaryButtonClassNames, type DemoAccent } from '../../theme/accent'
import {
  cancelButtonClassNames,
  fieldLabelClassNames,
  primaryButtonShellClassNames,
  textFieldClassNames,
} from '../../theme/field-styles'
import { useTranslator } from './use-translator'

const languages = [
  { code: 'de', name: 'German' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
]

// German puts the verb last in subordinate clauses and builds long compound
// nouns, so a translation has to restructure the sentence rather than swap words
// one by one. Dates, times, and the formal address are the details to check.
const sampleText = `Weil die Softwareaktualisierung länger dauert als geplant, verschiebt sich die Freischaltung der Übersetzungsfunktion auf den 14. August. Nutzerinnen und Nutzer, die sich bereits angemeldet haben, behalten ihren Zugang und müssen nichts weiter tun. Sollten am Freitag erneut Verbindungsprobleme auftreten, benachrichtigen wir Sie noch am selben Tag per E-Mail.`

export function TranslatorDemo({ accent }: { accent: DemoAccent }) {
  const [sourceLanguage, setSourceLanguage] = useState('de')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [input, setInput] = useState(sampleText)
  const translator = useTranslator({ sourceLanguage, targetLanguage })
  const canRun =
    translator.request !== 'running' &&
    (translator.capability === 'ready' ||
      translator.capability === 'downloadable' ||
      translator.capability === 'downloading')

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
          <label className={fieldLabelClassNames}>
            Source language
            <select
              className={`${textFieldClassNames} bg-white`}
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
          <label className={fieldLabelClassNames}>
            Target language
            <select
              className={`${textFieldClassNames} bg-white`}
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
        <label className={fieldLabelClassNames}>
          Text to translate
          <textarea
            className={`${textFieldClassNames} min-h-32`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames}`}
            disabled={!canRun || !input.trim() || sourceLanguage === targetLanguage}
            type="submit"
          >
            {translator.capability === 'downloadable' ||
            translator.capability === 'downloading'
              ? 'Download model and translate'
              : 'Translate'}
          </button>
          {translator.request === 'running' ? (
            <button
              className={cancelButtonClassNames}
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
