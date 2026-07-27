import { Fragment } from 'react'

import { documentationNavGroups } from '../../docs/documentation-content'
import { accentForDocumentationSection } from '../../docs/documentation-accents'
import { navItemClassNames } from '../../theme/accent'
import {
  documentationHash,
  playgroundHash,
  type DocumentationSectionId,
} from '../navigation'
import { NavGroupLabel } from './nav-group-label'

// Documentation sections are plain anchors rather than buttons: they are real
// locations, so they should be shareable, openable in a new tab, and reachable
// with Tab like any other link.
export function DocumentationSidebar({
  onNavigate,
  selectedSectionId,
}: {
  onNavigate: () => void
  selectedSectionId: DocumentationSectionId
}) {
  return (
    <div className="flex flex-col gap-1 px-3 py-4">
      <a
        className="mb-2 flex items-center rounded-lg border border-brand-blue/25 bg-brand-blue/5 px-3 py-2 text-sm font-bold text-brand-blue hover:bg-brand-blue/10"
        href={playgroundHash('translator')}
        onClick={onNavigate}
      >
        <span aria-hidden="true" className="mr-2">
          ←
        </span>
        Back to playground
      </a>

      {documentationNavGroups.map((group) => (
        <Fragment key={group.label}>
          <NavGroupLabel label={group.label} />
          {group.items.map((item) => {
            const selected = item.id === selectedSectionId
            const accent =
              navItemClassNames[accentForDocumentationSection(item.id)]
            return (
              <a
                aria-current={selected ? 'page' : undefined}
                className={
                  selected
                    ? `flex w-full items-center rounded-lg border px-3 py-2 text-left text-sm font-bold shadow-sm ${accent.active}`
                    : `${accent.hover} flex w-full items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700`
                }
                href={documentationHash(item.id)}
                key={item.id}
                onClick={onNavigate}
              >
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block size-2 shrink-0 rounded-full bg-current"
                />
                {item.label}
              </a>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
