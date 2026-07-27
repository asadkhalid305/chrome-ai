import { useState } from 'react'

import type {
  DemoId,
  DocumentationSectionId,
} from '../app/navigation'
import {
  accentBorderClassNames,
  accentSoftFillClassNames,
  accentTextClassNames,
  primaryButtonClassNames,
  type DemoAccent,
} from '../theme/accent'
import { primaryButtonShellClassNames } from '../theme/field-styles'
import { accentForDocumentationSection } from './documentation-accents'
import {
  apiGuideById,
  documentationArticleById,
  type ApiGuide,
  type DocumentationArticle,
  type Exercise,
  type SourceLink,
} from './documentation-content'

interface DocumentationPageProps {
  sectionId: DocumentationSectionId
  isDemoAvailable: (demoId: DemoId) => boolean
  onOpenDemo: (demoId: DemoId) => void
}

const statusStyles: Record<ApiGuide['status'], string> = {
  Stable: 'border-brand-green/35 bg-brand-green/10 text-brand-green',
  'Developer trial': 'border-amber-300 bg-amber-50 text-amber-900',
  'Origin trial': 'border-brand-blue/35 bg-brand-blue/10 text-brand-blue',
}

async function copyToClipboard(value: string) {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
    await navigator.clipboard.writeText(value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.className = 'fixed -left-[9999px] top-0'
    document.body.append(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
}

function SourceList({ sources }: { sources: SourceLink[] }) {
  return (
    <ul className="mt-4 grid gap-2">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            className="text-brand-blue inline-flex items-center gap-1 font-semibold underline decoration-brand-blue/30 underline-offset-4 hover:decoration-brand-blue"
            href={source.url}
            rel="noreferrer"
            target="_blank"
          >
            {source.label}
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

function ExerciseCard({
  exercise,
  index,
  accent,
}: {
  exercise: Exercise
  index: number
  accent: DemoAccent
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  async function handleCopy(label: string, value: string) {
    await copyToClipboard(value)
    setCopiedField(label)
    window.setTimeout(() => setCopiedField(null), 1800)
  }

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
          const copyLabel = `${exercise.title}-${field.label}`
          const copied = copiedField === copyLabel
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
                  onClick={() => void handleCopy(copyLabel, field.value)}
                  type="button"
                >
                  {copied ? 'Copied' : 'Copy'}
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

function OnThisPage({ items }: { items: Array<{ id: string; label: string }> }) {
  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          On this page
        </p>
        <nav aria-label="On this page" className="mt-3">
          <ul className="grid gap-2 text-sm">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className="text-left text-slate-600 hover:text-brand-blue"
                  onClick={() => scrollToSection(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

function ArticlePage({ article }: { article: DocumentationArticle }) {
  const toc = article.sections.map((section, index) => ({
    id: `article-section-${index}`,
    label: section.heading,
  }))
  if (article.sources?.length) {
    toc.push({ id: 'official-sources', label: 'Official sources' })
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="min-w-0 rounded-3xl border border-brand-blue/15 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-brand-blue text-sm font-bold uppercase tracking-[0.18em]">
          {article.eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          {article.summary}
        </p>

        <div className="mt-10 grid gap-10">
          {article.sections.map((section, index) => (
            <section id={`article-section-${index}`} key={section.heading}>
              <h2 className="text-xl font-bold text-slate-950">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  className="mt-3 max-w-3xl leading-7 text-slate-600"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 grid list-disc gap-2 pl-5 leading-7 text-slate-600">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {article.sources?.length ? (
          <section
            className="mt-10 border-t border-slate-200 pt-8"
            id="official-sources"
          >
            <h2 className="text-xl font-bold text-slate-950">
              Official sources
            </h2>
            <SourceList sources={article.sources} />
          </section>
        ) : null}
      </article>
      <OnThisPage items={toc} />
    </div>
  )
}

function GuidePage({
  guide,
  demoAvailable,
  onOpenDemo,
}: {
  guide: ApiGuide
  demoAvailable: boolean
  onOpenDemo: (demoId: DemoId) => void
}) {
  // A guide takes the accent of the demo it documents, so the reader sees the
  // same color in the sidebar, the tab, and the demo card.
  const accent = accentForDocumentationSection(guide.id)
  const toc = [
    { id: 'availability', label: 'Availability' },
    { id: 'when-to-use', label: 'When to use it' },
    { id: 'playground-lesson', label: 'Playground lesson' },
  ]
  if (guide.workflow) toc.push({ id: 'testing-workflow', label: guide.workflow.title })
  if (guide.exercises.length) toc.push({ id: 'challenges', label: 'Challenges' })
  toc.push(
    { id: 'limits-and-lifecycle', label: 'Limits and lifecycle' },
    { id: 'official-sources', label: 'Official sources' },
  )

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article
        className={`min-w-0 rounded-3xl border border-t-4 bg-white p-6 shadow-sm sm:p-8 ${accentBorderClassNames[accent]}`}
      >
        <p
          className={`text-sm font-bold uppercase tracking-[0.18em] ${accentTextClassNames[accent]}`}
        >
          {guide.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
          {guide.summary}
        </p>

        <section className="mt-10" id="availability">
          <h2 className="text-xl font-bold text-slate-950">
            Availability and prerequisites
          </h2>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[guide.status]}`}
            >
              {guide.status}
            </span>
            <span>{guide.statusDetail}</span>
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 leading-7 text-slate-600">
            {guide.prerequisites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10" id="when-to-use">
          <h2 className="text-xl font-bold text-slate-950">When to use it</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-green/25 bg-brand-green/5 p-4">
              <h3 className="font-bold text-slate-950">Good fit</h3>
              <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-6 text-slate-600">
                {guide.goodFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-red/25 bg-brand-red/5 p-4">
              <h3 className="font-bold text-slate-950">Poor fit</h3>
              <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-6 text-slate-600">
                {guide.avoidFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10" id="playground-lesson">
          <h2 className="text-xl font-bold text-slate-950">
            What the playground teaches
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            {guide.playground}
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 leading-7 text-slate-600">
            {guide.observe.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {guide.demoId ? (
            <button
              className={`mt-5 disabled:text-slate-600 ${primaryButtonShellClassNames} ${primaryButtonClassNames[accent]}`}
              disabled={!demoAvailable}
              onClick={() => onOpenDemo(guide.demoId as DemoId)}
              type="button"
            >
              {demoAvailable ? 'Open demo' : 'Demo hidden by app flag'}
            </button>
          ) : null}
        </section>

        {guide.workflow ? (
          <section
            className="mt-10 rounded-2xl border border-brand-blue/25 bg-brand-blue/5 p-5"
            id="testing-workflow"
          >
            <h2 className="text-xl font-bold text-slate-950">
              {guide.workflow.title}
            </h2>
            <ol className="mt-4 grid list-decimal gap-3 pl-5 leading-7 text-slate-600">
              {guide.workflow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {guide.exercises.length ? (
          <section className="mt-10" id="challenges">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className={`text-xs font-black uppercase tracking-[0.16em] ${accentTextClassNames[accent]}`}
                >
                  Try it yourself
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Three capability challenges
                </h2>
              </div>
              {guide.demoId ? (
                <button
                  className="text-brand-blue rounded-lg px-3 py-2 text-sm font-bold hover:bg-brand-blue/10 disabled:text-slate-400"
                  disabled={!demoAvailable}
                  onClick={() => onOpenDemo(guide.demoId as DemoId)}
                  type="button"
                >
                  Open demo
                </button>
              ) : null}
            </div>
            <div className="mt-5 grid gap-5">
              {guide.exercises.map((exercise, index) => (
                <ExerciseCard
                  accent={accent}
                  exercise={exercise}
                  index={index}
                  key={exercise.title}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10" id="limits-and-lifecycle">
          <h2 className="text-xl font-bold text-slate-950">
            Limits and lifecycle
          </h2>
          <ul className="mt-4 grid list-disc gap-2 pl-5 leading-7 text-slate-600">
            {guide.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p
            className={`mt-5 rounded-xl px-4 py-3 leading-7 text-slate-700 ${accentSoftFillClassNames[accent]}`}
          >
            <span className="font-bold text-slate-950">Lifecycle:</span>{' '}
            {guide.lifecycle}
          </p>
        </section>

        <section
          className="mt-10 border-t border-slate-200 pt-8"
          id="official-sources"
        >
          <h2 className="text-xl font-bold text-slate-950">
            Official sources
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Claims reviewed {guide.reviewedOn}. Recheck experimental status
            before shipping.
          </p>
          <SourceList sources={guide.sources} />
        </section>
      </article>
      <OnThisPage items={toc} />
    </div>
  )
}

export function DocumentationPage({
  sectionId,
  isDemoAvailable,
  onOpenDemo,
}: DocumentationPageProps) {
  const article = documentationArticleById.get(sectionId)
  if (article) return <ArticlePage article={article} />

  const guide = apiGuideById.get(sectionId) ?? apiGuideById.get('webmcp')
  if (!guide) return null

  return (
    <GuidePage
      demoAvailable={guide.demoId ? isDemoAvailable(guide.demoId) : false}
      guide={guide}
      onOpenDemo={onOpenDemo}
    />
  )
}
