import type { DemoAccent } from './demo-section'

// Shared per-accent Tailwind treatments for interactive elements that more
// than one demo needs identically: a primary action button, a soft preview
// box (e.g. Writer's draft, WebMCP's "what the agent sees" card), and status
// text that should read in the demo's own color. Kept separate from
// `DemoSection`'s and `OutputPanel`'s own accent maps, which each style one
// fixed element. Centralizing these means a demo's accent prop — not a
// hand-picked color literal — decides every colored element in its body, so
// the tab and its content can never fall out of sync again.
//
// Yellow uses dark text/foregrounds throughout because brand yellow is too
// light for white text (same reasoning as DemoSection and the nav tabs).
export const primaryButtonClassNames: Record<DemoAccent, string> = {
  yellow: 'bg-brand-yellow hover:bg-brand-yellow/85 text-slate-950',
  red: 'bg-brand-red hover:bg-brand-red/85 text-white',
  green: 'bg-brand-green hover:bg-brand-green/85 text-white',
  blue: 'bg-brand-blue hover:bg-brand-blue/85 text-white',
}

export const softBoxClassNames: Record<DemoAccent, string> = {
  yellow: 'border-brand-yellow/25 bg-brand-yellow/5',
  red: 'border-brand-red/25 bg-brand-red/5',
  green: 'border-brand-green/25 bg-brand-green/5',
  blue: 'border-brand-blue/25 bg-brand-blue/5',
}

export const accentTextClassNames: Record<DemoAccent, string> = {
  yellow: 'text-brand-yellow',
  red: 'text-brand-red',
  green: 'text-brand-green',
  blue: 'text-brand-blue',
}

// A small pill/badge treatment, e.g. marking which items in a list came from
// an agent rather than a person.
export const accentBadgeClassNames: Record<DemoAccent, string> = {
  yellow: 'border-brand-yellow/40 bg-brand-yellow/10 text-brand-yellow',
  red: 'border-brand-red/40 bg-brand-red/10 text-brand-red',
  green: 'border-brand-green/40 bg-brand-green/10 text-brand-green',
  blue: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue',
}
