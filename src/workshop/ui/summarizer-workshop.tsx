import { useState } from 'react'
import { primaryButtonClassNames, type DemoAccent } from '../../theme/accent'
import {
  cancelButtonClassNames,
  fieldLabelClassNames,
  primaryButtonShellClassNames,
  textFieldClassNames,
} from '../../theme/field-styles'
import { availability, runExercise } from '../exercises/summarizer'
import { useWorkshopRequest } from './use-workshop-request'
import { WorkshopFrame } from './workshop-frame'

export function SummarizerWorkshop({ accent }: { accent: DemoAccent }) {
  const [input, setInput] = useState(
    'Our frontend team tested a browser-based writing assistant for two weeks. Support staff liked keeping draft messages on their laptops, while designers wanted clearer feedback during model downloads. The team decided to add download progress before expanding the pilot. Maya will build the progress indicator by Friday. Jonas will collect feedback from five support colleagues next week. The public launch date and pricing remain undecided. The next review is on Tuesday at 10:00.',
  )
  const model = useWorkshopRequest(availability, runExercise)
  const canRun =
    model.request !== 'running' &&
    ['ready', 'downloadable', 'downloading'].includes(model.capability)

  return (
    <WorkshopFrame
      id="summarizer"
      title="Read less, keep the decisions"
      goal="Add a summary button to this small article reader. Recommended first exercise."
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
          Article text
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
              : 'Summarize'}
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
