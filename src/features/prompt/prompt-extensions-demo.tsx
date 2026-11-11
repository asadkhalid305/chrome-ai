import { useState } from 'react'
import { CapabilityStatus } from '../../components/capability-status'
import { DemoOutput } from '../../components/demo-output'
import { primaryButtonClassNames, type DemoAccent } from '../../theme/accent'
import {
  cancelButtonClassNames,
  fieldLabelClassNames,
  primaryButtonShellClassNames,
  textFieldClassNames,
} from '../../theme/field-styles'
import type { PromptExtension } from './prompt-extensions-api'
import { usePromptExtension } from './use-prompt-extension'

function ExtensionExercise({
  mode,
  accent,
}: {
  mode: PromptExtension
  accent: DemoAccent
}) {
  const [input, setInput] = useState(
    mode === 'structured'
      ? 'The workshop examples were useful, but the model download took too long.'
      : mode === 'image'
        ? 'Describe this image in one sentence in English. Do not guess details you cannot see.'
        : 'Explain in three short paragraphs how a browser can prepare and reuse a local model.',
  )
  const [image, setImage] = useState<File | null>(null)
  const model = usePromptExtension(mode)
  const canRun =
    model.request !== 'running' &&
    ['ready', 'downloadable', 'downloading'].includes(model.capability)
  return (
    <div className="mt-4 grid gap-4">
      <CapabilityStatus
        capability={model.capability}
        downloadProgress={model.downloadProgress}
      />
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void model.run(input, image)
        }}
      >
        <label className={fieldLabelClassNames}>
          Extension prompt
          <textarea
            className={textFieldClassNames}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        {mode === 'image' ? (
          <label className={fieldLabelClassNames}>
            Local image
            <input
              className="peer sr-only"
              aria-label="Local image"
              type="file"
              accept="image/*"
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            />
            <span
              className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames} w-fit cursor-pointer peer-focus-visible:ring-4 peer-focus-visible:ring-brand-blue/20`}
            >
              Choose image
            </span>
            <span
              className="text-sm font-normal text-slate-600"
              aria-live="polite"
            >
              {image?.name ?? 'No image selected'}
            </span>
          </label>
        ) : null}
        <p className="text-sm text-slate-600">
          {mode === 'structured'
            ? 'The JSON Schema allows positive, negative, or mixed sentiment and a summary. Application validation rejects malformed responses; a valid shape does not prove a correct classification.'
            : mode === 'image'
              ? 'The image is passed directly to Chrome. Capability is checked with image input declared. Review the generated description for accuracy.'
              : 'Chunks appear as Chrome produces them. Cancel aborts the native request; partial output is incomplete.'}
        </p>
        <div className="flex gap-3">
          <button
            type="submit"
            className={`${primaryButtonClassNames[accent]} ${primaryButtonShellClassNames}`}
            disabled={!canRun || !input.trim() || (mode === 'image' && !image)}
          >
            Run extension
          </button>
          {model.request === 'running' ? (
            <button
              type="button"
              className={cancelButtonClassNames}
              onClick={model.cancel}
            >
              Cancel extension
            </button>
          ) : null}
        </div>
      </form>
      <DemoOutput
        accent={accent}
        capability={model.capability}
        request={model.request}
        output={model.output}
        partialOutput={mode === 'stream' ? model.partial : undefined}
        error={model.error}
        emptyMessage="Run the selected extension to see its result."
      />
    </div>
  )
}

export function PromptExtensionsDemo({ accent }: { accent: DemoAccent }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PromptExtension>('structured')
  return (
    <details
      className="mt-6 rounded-xl border border-slate-200 p-4"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer font-semibold">
        Production extensions: structured output, image input, streaming
      </summary>
      <p className="mt-3 text-sm text-slate-600">
        Reviewed 10 November 2026. Each exercise owns and destroys its own
        session. Changing exercises discards its conversation. No experimental
        sampling controls are used.{' '}
        <a
          className="underline"
          href="https://developer.chrome.com/docs/ai/prompt-api"
          target="_blank"
          rel="noreferrer"
        >
          Official Prompt API guide
        </a>
      </p>
      <label className={`${fieldLabelClassNames} mt-4`}>
        Prompt extension
        <select
          className={textFieldClassNames}
          value={mode}
          onChange={(event) => setMode(event.target.value as PromptExtension)}
        >
          <option value="structured">Validated structured feedback</option>
          <option value="image">Image description</option>
          <option value="stream">Streaming and cancellation</option>
        </select>
      </label>
      {open ? (
        <ExtensionExercise key={mode} mode={mode} accent={accent} />
      ) : null}
    </details>
  )
}
