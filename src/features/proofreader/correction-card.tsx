// Chrome describes a correction as a range in the text it was given, not as a
// quoted phrase. Showing that range inside its surrounding words is what makes
// the offsets legible: a range can be empty, and the replacement can be empty
// too, so a card that only prints "original" and "suggestion" looks broken on
// exactly the corrections that are most interesting.
const contextCharacters = 32

export function CorrectionCard({
  input,
  correction,
}: {
  input: string
  correction: ProofreadCorrection
}) {
  const flagged = input.slice(correction.startIndex, correction.endIndex)
  const before = input.slice(
    Math.max(0, correction.startIndex - contextCharacters),
    correction.startIndex,
  )
  const after = input.slice(
    correction.endIndex,
    correction.endIndex + contextCharacters,
  )
  const isInsertion = flagged.length === 0
  const isDeletion = !isInsertion && correction.correction.length === 0

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-3 text-slate-800">
      <p className="text-sm leading-relaxed">
        <span className="text-slate-500">
          {correction.startIndex > before.length ? '…' : ''}
          {before}
        </span>
        {isInsertion ? (
          <mark className="bg-brand-yellow/30 rounded px-1 text-slate-900">
            <span className="sr-only">insertion point</span>▍
          </mark>
        ) : (
          <mark className="bg-brand-red/10 decoration-brand-red rounded px-1 text-slate-900 line-through">
            {flagged}
          </mark>
        )}
        <span className="text-slate-500">
          {after}
          {correction.endIndex + after.length < input.length ? '…' : ''}
        </span>
      </p>
      <p className="mt-2">
        <span className="font-semibold">
          {isInsertion ? 'Insert' : isDeletion ? 'Delete' : 'Replace with'}
          {isDeletion ? ' the marked text' : ''}:
        </span>{' '}
        {isDeletion ? (
          <span className="text-slate-500">nothing</span>
        ) : (
          correction.correction
        )}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Characters {correction.startIndex}–{correction.endIndex}
      </p>
      {correction.types && correction.types.length > 0 ? (
        <p className="mt-1">
          <span className="font-semibold">Category:</span>{' '}
          {correction.types.join(', ')}
        </p>
      ) : null}
      {correction.explanation ? (
        <p className="mt-1">
          <span className="font-semibold">Explanation:</span>{' '}
          {correction.explanation}
        </p>
      ) : null}
    </li>
  )
}
