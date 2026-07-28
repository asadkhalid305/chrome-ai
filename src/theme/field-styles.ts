// Class strings that every demo form repeats verbatim. Only the strings are
// shared: each demo still writes out its own label, field, form, and buttons, so
// a reader can see the whole form in one file. Demos append their own sizing and
// per-field classes alongside these.

export const fieldLabelClassNames =
  'grid gap-2 text-sm font-semibold text-slate-800'

// The label sets `font-semibold` for its own text, so the control inside it has
// to reset to `font-normal`.
export const textFieldClassNames =
  'focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl border border-slate-300 px-3 py-2 font-normal focus:ring-4 focus:outline-none'

// Everything about the submit button except its accent color, which comes from
// `primaryButtonClassNames` in accent.ts.
export const primaryButtonShellClassNames =
  'rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-300'

// Cancel is always red rather than accent-colored: it means the same thing in
// every demo, and stopping work should not blend into the demo's palette.
export const cancelButtonClassNames =
  'border-brand-red text-brand-red hover:bg-brand-red/5 rounded-xl border px-4 py-2 text-sm font-bold'
