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

// A notice in the stairwell: silly enough to be worth reading out loud, and
// still built the way German is. The verb lands at the end of the clause
// ("geworfen hat"), the condition drops its "wenn" ("Sollte Fridolin öffnen"),
// and the compound nouns have to be unpacked rather than swapped word for word.
const sampleText = `Liebe Nachbarn, weil unser Kater Fridolin gestern die Fernbedienung in den Kühlschrank geworfen hat, läuft bei uns seit elf Stunden ununterbrochen eine Kochsendung. Wer eine Ersatzfernbedienung übrig hat, darf sie gern vorbeibringen; wir bezahlen in selbstgebackenem Kuchen. Sollte Fridolin die Tür öffnen, geben Sie ihm bitte nichts — er hat beim Grillfest schon die halbe Bratwurst mitgenommen.`

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
