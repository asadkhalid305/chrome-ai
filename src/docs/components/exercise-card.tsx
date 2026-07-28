import {
  accentBorderClassNames,
  accentSoftFillClassNames,
  accentTextClassNames,
  type DemoAccent,
} from '../../theme/accent'
import type { Exercise } from '../documentation-content'
import { useCopyToClipboard } from '../hooks/use-copy-to-clipboard'

// One capability challenge: what to try, the exact values to paste into the
// demo, and what to watch for. The values are shown as text rather than
// pre-filled into the demo so the reader performs the step themselves.
export function ExerciseCard({
  exercise,
  index,
  accent,
}: {
  exercise: Exercise
  index: number
  accent: DemoAccent
}) {
  const { copiedKey, copy } = useCopyToClipboard()

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm ${accentBorderClassNames[accent]}`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.16em] ${accentTextClassNames[accent]}`}
      >
        Challenge {index + 1}
      </p>
      <h3 className="mt-2 text-lg font-bold text-slate-950">
        {exercise.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{exercise.goal}</p>

      {exercise.setup ? (
        <p
          className={`mt-4 rounded-xl px-3 py-2 text-sm ${accentSoftFillClassNames[accent]}`}
        >
          <span className="font-semibold text-slate-900">Setup:</span>{' '}
          {exercise.setup}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        {exercise.fields.map((field) => {
          const copyKey = `${exercise.title}-${field.label}`
          return (
            <div
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              key={field.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {field.label}
                </p>
                <button
                  className="text-brand-blue rounded-md px-2 py-1 text-xs font-bold hover:bg-brand-blue/10"
                  onClick={() => void copy(copyKey, field.value)}
                  type="button"
                >
                  {copiedKey === copyKey ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">
                {field.value || '(leave empty)'}
              </pre>
            </div>
          )
        })}
      </div>

      <dl className="mt-4 grid gap-3 text-sm leading-6">
        <div>
          <dt className="font-semibold text-slate-950">What to observe</dt>
          <dd className="text-slate-600">{exercise.observe}</dd>
        </div>
        {exercise.expected ? (
          <div>
            <dt className="font-semibold text-slate-950">
              Expected DevTools signal
            </dt>
            <dd className="text-slate-600">{exercise.expected}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}
