import type { ReactNode } from 'react'

import { outputPanelClassNames, type DemoAccent } from '../theme/accent'

interface OutputPanelProps {
  busy?: boolean
  accent: DemoAccent
  children: ReactNode
}

export function OutputPanel({ accent, children, busy = false }: OutputPanelProps) {
  return (
    <div
      className={`min-h-28 rounded-xl border bg-slate-950 p-4 text-sm leading-6 text-slate-100 ${outputPanelClassNames[accent]}`}
      aria-live="polite"
      aria-busy={busy || undefined}
    >
      {children}
    </div>
  )
}
