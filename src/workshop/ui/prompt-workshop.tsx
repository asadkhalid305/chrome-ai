import { useState } from 'react'
import { workshopSolutionsEnabled } from '../../app/feature-flags'
import {
  accentSoftFillClassNames,
  accentTextClassNames,
  primaryButtonClassNames,
  type DemoAccent,
} from '../../theme/accent'
import {
  cancelButtonClassNames,
  fieldLabelClassNames,
  primaryButtonShellClassNames,
  textFieldClassNames,
} from '../../theme/field-styles'
import {
  availability,
  runExercise,
  imageAvailability,
  runImageExercise,
  streamingAvailability,
  runStreamingExercise,
} from '../exercises/prompt'
import { useWorkshopRequest } from './use-workshop-request'
import { WorkshopFrame } from './workshop-frame'

type PromptMode = 'text' | 'image' | 'streaming'
type PromptInput = { input: string; image: File | null }

// Remounting a choice aborts the old request and clears its file/partial output.
export function PromptWorkshop({ accent }: { accent: DemoAccent }) {
  const [mode, setMode] = useState<PromptMode>('text')
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-slate-500" aria-hidden="true">
          Prompt exercise
        </span>
        <div
          role="group"
          aria-label="Prompt exercise"
          className="inline-flex rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm"
        >
          {(['text', 'image', 'streaming'] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              aria-pressed={mode === choice}
              onClick={() => setMode(choice)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ${
                mode === choice
                  ? `${accentSoftFillClassNames[accent]} ${accentTextClassNames[accent]}`
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {choice === 'text'
                ? 'Text'
                : choice === 'image'
                ? 'Image'
                : 'Streaming'}
            </button>
          ))}
        </div>
      </div>
      <PromptExercise key={mode} mode={mode} accent={accent} />
    </div>
  )
}

function PromptExercise({
  mode,
  accent,
}: {
  mode: PromptMode
  accent: DemoAccent
}) {
  const [input, setInput] = useState(
    mode === 'image'
      ? 'Describe this image in one short English paragraph. Do not guess details you cannot see.'
      : mode === 'streaming'
      ? 'Explain in three short paragraphs how a browser can download and use a local AI model.'
      : 'Hi! I enjoyed the browser AI talk, but I could not finish the exercise because the model was still downloading. Where can I find the example and continue later? Please explain that the examples are in this repository and that I can retry once the download finishes.',
  )
  const [image, setImage] = useState<File | null>(null)
  const checkAvailability =
    mode === 'image'
      ? imageAvailability
      : mode === 'streaming'
      ? streamingAvailability
      : availability
  const model = useWorkshopRequest<PromptInput>(
    checkAvailability,
    (request, signal, progress, partial) => {
      if (mode === 'image') {
        if (!request.image) throw new Error('Choose an image file first.')
        return runImageExercise(request.input, request.image, signal, progress)
      }
      if (mode === 'streaming')
        return runStreamingExercise(request.input, signal, progress, partial)
      return runExercise(request.input, signal, progress)
    },
  )
  const canRun =
    model.request !== 'running' &&
    ['ready', 'downloadable', 'downloading'].includes(model.capability)

  return (
    <WorkshopFrame
      id="prompt"
      title={
        mode === 'image'
          ? 'Describe an image'
          : mode === 'streaming'
          ? 'An answer as it arrives'
          : 'A helpful email reply'
      }
      goal={
        mode === 'image'
          ? 'Implement a fresh multimodal session for a local image and text prompt.'
          : mode === 'streaming'
          ? 'Implement a fresh session and stream partial text with cancellation.'
          : 'Use a system instruction and the Prompt API to draft a short, friendly English reply.'
      }
      accent={accent}
      model={model}
    >
      {!workshopSolutionsEnabled ? (
        <p className="mt-4 text-sm text-slate-700">
          Functions to implement:{' '}
          <code>
            {mode === 'image'
              ? 'imageAvailability + runImageExercise'
              : mode === 'streaming'
              ? 'streamingAvailability + runStreamingExercise'
              : 'availability + runExercise'}
          </code>
          . Each choice has separate options and five TODOs in prompt.ts. Choose
          one or work through all three.
        </p>
      ) : null}
      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void model.run({ input, image })
        }}
      >
        <label className={fieldLabelClassNames}>
          {mode === 'text' ? 'Email to reply to' : 'Prompt text'}
          <textarea
            className={`${textFieldClassNames} min-h-40`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        {mode === 'image' ? (
          <label className={fieldLabelClassNames}>
            Local image
            <input
              className={textFieldClassNames}
              aria-label="Local image"
              type="file"
              accept="image/*"
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            />
            <span className="text-sm font-normal text-slate-600">
              {image?.name ?? 'No image selected'}
            </span>
          </label>
        ) : null}
        <div className="flex gap-3">
          <button
            className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames}`}
            type="submit"
            disabled={!canRun || !input.trim() || (mode === 'image' && !image)}
          >
            {model.capability === 'downloadable' ||
            model.capability === 'downloading'
              ? 'Download model and run'
              : mode === 'image'
              ? 'Describe image'
              : mode === 'streaming'
              ? 'Stream answer'
              : 'Draft reply'}
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
