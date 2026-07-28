// Every accent-dependent Tailwind class in the application lives here, so a
// demo's accent prop is the only thing that decides its colors. Previously each
// consumer kept its own map and they drifted apart; a tab could end up a
// different color from the panel it opened.
//
// Yellow uses dark text on colored fills throughout: brand yellow (#fbbf0e) is
// too light to carry white text at an accessible contrast ratio.

export type DemoAccent = 'yellow' | 'red' | 'green' | 'blue'

// Demos are colored by their position in the playground order rather than by a
// hand-picked color, so adding a demo cannot accidentally repeat its neighbor.
export const accentCycle: DemoAccent[] = ['yellow', 'red', 'green', 'blue']

export function accentForPosition(index: number): DemoAccent {
  return accentCycle[index % accentCycle.length]
}

// Sidebar navigation items, in both the playground tab list and the
// documentation section list.
export const navItemClassNames: Record<
  DemoAccent,
  { active: string; hover: string }
> = {
  yellow: {
    active: 'border-brand-yellow bg-brand-yellow text-slate-950',
    hover: 'hover:border-brand-yellow hover:text-brand-yellow',
  },
  red: {
    active: 'border-brand-red bg-brand-red text-white',
    hover: 'hover:border-brand-red hover:text-brand-red',
  },
  green: {
    active: 'border-brand-green bg-brand-green text-white',
    hover: 'hover:border-brand-green hover:text-brand-green',
  },
  blue: {
    active: 'border-brand-blue bg-brand-blue text-white',
    hover: 'hover:border-brand-blue hover:text-brand-blue',
  },
}

// The card that wraps one demo: its outer border, its eyebrow label, and the
// rule above the footer metadata.
export const demoSectionClassNames: Record<
  DemoAccent,
  { section: string; eyebrow: string; divider: string }
> = {
  yellow: {
    section: 'border-brand-yellow/30 border-t-brand-yellow',
    eyebrow: 'text-brand-yellow',
    divider: 'border-brand-yellow',
  },
  red: {
    section: 'border-brand-red/30 border-t-brand-red',
    eyebrow: 'text-brand-red',
    divider: 'border-brand-red',
  },
  green: {
    section: 'border-brand-green/30 border-t-brand-green',
    eyebrow: 'text-brand-green',
    divider: 'border-brand-green',
  },
  blue: {
    section: 'border-brand-blue/30 border-t-brand-blue',
    eyebrow: 'text-brand-blue',
    divider: 'border-brand-blue',
  },
}

// The dark output panel. Tailwind cannot reference a theme variable inside an
// arbitrary inset-shadow value, so the brand hex is repeated here; it must stay
// in sync with `--color-brand-*` in index.css.
export const outputPanelClassNames: Record<DemoAccent, string> = {
  yellow: 'border-brand-yellow/40 shadow-[inset_4px_0_0_#fbbf0e]',
  red: 'border-brand-red/40 shadow-[inset_4px_0_0_#e23a2d]',
  green: 'border-brand-green/40 shadow-[inset_4px_0_0_#259644]',
  blue: 'border-brand-blue/40 shadow-[inset_4px_0_0_#1a73e8]',
}

export const primaryButtonClassNames: Record<DemoAccent, string> = {
  yellow: 'bg-brand-yellow hover:bg-brand-yellow/85 text-slate-950',
  red: 'bg-brand-red hover:bg-brand-red/85 text-white',
  green: 'bg-brand-green hover:bg-brand-green/85 text-white',
  blue: 'bg-brand-blue hover:bg-brand-blue/85 text-white',
}

// A bordered soft box, e.g. Writer's draft preview or WebMCP's "what the agent
// sees" card.
export const softBoxClassNames: Record<DemoAccent, string> = {
  yellow: 'border-brand-yellow/25 bg-brand-yellow/5',
  red: 'border-brand-red/25 bg-brand-red/5',
  green: 'border-brand-green/25 bg-brand-green/5',
  blue: 'border-brand-blue/25 bg-brand-blue/5',
}

// A borderless soft fill, used for callout paragraphs in the documentation.
// Yellow carries more fill than the others because without a border to define
// its edge, the lightest brand color barely registers against white.
export const accentSoftFillClassNames: Record<DemoAccent, string> = {
  yellow: 'bg-brand-yellow/10',
  red: 'bg-brand-red/5',
  green: 'bg-brand-green/5',
  blue: 'bg-brand-blue/5',
}

export const accentTextClassNames: Record<DemoAccent, string> = {
  yellow: 'text-brand-yellow',
  red: 'text-brand-red',
  green: 'text-brand-green',
  blue: 'text-brand-blue',
}

export const accentBorderClassNames: Record<DemoAccent, string> = {
  yellow: 'border-brand-yellow/35',
  red: 'border-brand-red/35',
  green: 'border-brand-green/35',
  blue: 'border-brand-blue/35',
}

// A small pill/badge treatment, e.g. marking which items in a list came from an
// agent rather than a person.
export const accentBadgeClassNames: Record<DemoAccent, string> = {
  yellow: 'border-brand-yellow/40 bg-brand-yellow/10 text-brand-yellow',
  red: 'border-brand-red/40 bg-brand-red/10 text-brand-red',
  green: 'border-brand-green/40 bg-brand-green/10 text-brand-green',
  blue: 'border-brand-blue/40 bg-brand-blue/10 text-brand-blue',
}
