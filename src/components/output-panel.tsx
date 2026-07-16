import type { ReactNode } from 'react'

export type OutputAccent = 'yellow' | 'red' | 'green' | 'blue'

const accentClassNames: Record<OutputAccent, string> = {
  yellow:
    'border-brand-yellow/40 shadow-[inset_4px_0_0_#fbbf0e]',
  red: 'border-brand-red/40 shadow-[inset_4px_0_0_#e23a2d]',
  green:
    'border-brand-green/40 shadow-[inset_4px_0_0_#259644]',
  blue: 'border-brand-blue/40 shadow-[inset_4px_0_0_#1a73e8]',
}

interface OutputPanelProps {
  accent: OutputAccent
  children: ReactNode
}

export function OutputPanel({ accent, children }: OutputPanelProps) {
  return (
    <div
      className={`min-h-28 rounded-xl border bg-slate-950 p-4 text-sm leading-6 text-slate-100 ${accentClassNames[accent]}`}
      aria-live="polite"
    >
      {children}
    </div>
  )
}
