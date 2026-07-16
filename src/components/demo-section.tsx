import type { ReactNode } from 'react'

interface DemoSectionProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  codePath: string
  lifecycleNote: string
}

export function DemoSection({
  eyebrow,
  title,
  description,
  children,
  codePath,
  lifecycleNote,
}: DemoSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
      </div>

      {children}

      <dl className="mt-8 grid gap-4 border-t border-slate-200 pt-5 text-sm text-slate-600 lg:grid-cols-2">
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
