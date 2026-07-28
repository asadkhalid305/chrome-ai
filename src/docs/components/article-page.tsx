import type { DocumentationArticle } from '../documentation-content'
import { OnThisPage } from './on-this-page'
import { SourceList } from './source-list'

// The prose pages: overview, browser requirements, choosing an API, and so on.
// Unlike a guide page these describe no single API, so they carry no accent.
export function ArticlePage({ article }: { article: DocumentationArticle }) {
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
