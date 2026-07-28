import type { SourceLink } from '../documentation-content'

// Every compatibility claim in the docs links to the official Chrome page it
// came from, so a reader can check whether it is still true.
export function SourceList({ sources }: { sources: SourceLink[] }) {
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
