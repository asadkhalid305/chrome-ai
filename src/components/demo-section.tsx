import { use, type ReactNode } from 'react'

import { RevealContext } from '../app/reveal-context'
import { ApiAvailabilityInfo, type ApiAvailability } from './api-availability'

export type DemoAccent = 'yellow' | 'red' | 'green' | 'blue'

const accentClassNames: Record<
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

interface DemoSectionProps {
  accent: DemoAccent
  eyebrow: string
  title: string
  description: string
  availability: ApiAvailability
  children: ReactNode
  codePath: string
  lifecycleNote: string
}

export function DemoSection({
  accent,
  eyebrow,
  title,
  description,
  availability,
  children,
  codePath,
  lifecycleNote,
}: DemoSectionProps) {
  const accentClasses = accentClassNames[accent]
  // The availability block names Chrome versions and flags, so it is part of
  // the reveal rather than shown by default.
  const revealed = use(RevealContext)

  return (
    <section
      className={`bg-brand-white rounded-3xl border border-t-4 p-6 shadow-sm sm:p-8 ${accentClasses.section}`}
    >
      <div className="mb-6">
        <p
          className={`text-sm font-bold uppercase tracking-[0.18em] ${accentClasses.eyebrow}`}
        >
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
        {revealed ? <ApiAvailabilityInfo availability={availability} /> : null}
      </div>

      {children}

      <dl
        className={`mt-8 grid gap-4 border-t pt-5 text-sm text-slate-600 lg:grid-cols-2 ${accentClasses.divider}`}
      >
        <div>
          <dt className="font-semibold text-slate-900">Code path</dt>
          <dd className="mt-1 font-mono text-xs leading-5">{codePath}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-900">Lifecycle note</dt>
          <dd className="mt-1">{lifecycleNote}</dd>
        </div>
      </dl>
    </section>
  )
}
