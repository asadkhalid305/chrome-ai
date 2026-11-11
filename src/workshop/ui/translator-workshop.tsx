import { useState } from 'react'
import { primaryButtonClassNames, type DemoAccent } from '../../theme/accent'
import {
  cancelButtonClassNames,
  fieldLabelClassNames,
  primaryButtonShellClassNames,
  textFieldClassNames,
} from '../../theme/field-styles'
import { availability, runExercise } from '../exercises/translator'
import { useWorkshopRequest } from './use-workshop-request'
import { WorkshopFrame } from './workshop-frame'

export function TranslatorWorkshop({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(
    'Hallo! Ich kann am Donnerstag nicht am Workshop teilnehmen. Gibt es eine Aufzeichnung oder einen weiteren Termin? Vielen Dank für Ihre Hilfe.',
  )
  const model = useWorkshopRequest(availability, runExercise)
  const canRun =
    model.request !== 'running' &&
    ['ready', 'downloadable', 'downloading'].includes(model.capability)

  return (
    <WorkshopFrame
      id="translator"
      title="A message across languages"
      goal="Translate a German customer message into English without sending its content to a server."
      accent={accent}
      model={model}
    >
      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void model.run(input)
        }}
      >
        <label className={fieldLabelClassNames}>
          German message
          <textarea
            className={`${textFieldClassNames} min-h-40`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="flex gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames}`}
            type="submit"
            disabled={!canRun || !input.trim()}
          >
            {model.capability === 'downloadable' ||
            model.capability === 'downloading'
              ? 'Download model and run'
              : 'Translate'}
          </button>
          {model.request === 'running' ? (
            <button
              className={cancelButtonClassNames}
              type="button"
              onClick={model.cancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </WorkshopFrame>
  )
}
