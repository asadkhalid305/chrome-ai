import { Fragment, type KeyboardEvent } from 'react'

import { navItemClassNames } from '../../theme/accent'
import type { Demo } from '../demo-registry'
import { documentationHash, type DemoId } from '../navigation'
import { NavGroupLabel } from './nav-group-label'

interface PlaygroundSidebarProps {
  demos: Demo[]
  selectedDemoId: DemoId
  onSelectDemo: (demoId: DemoId) => void
  onOpenDocumentation: () => void
  registerTab: (index: number) => (element: HTMLButtonElement | null) => void
  onTabKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void
}

// The playground is a tab list rather than a set of links because selecting a
// demo swaps a panel in place. Only the selected tab is in the Tab order; the
// arrow keys move between them, which is what the ARIA tabs pattern expects.
export function PlaygroundSidebar({
  demos,
  selectedDemoId,
  onSelectDemo,
  onOpenDocumentation,
  registerTab,
  onTabKeyDown,
}: PlaygroundSidebarProps) {
  return (
    <div
      aria-label="Playground"
      aria-orientation="vertical"
      className="flex flex-col gap-1 px-3 py-4"
      role="tablist"
    >
      <NavGroupLabel label="APIs" />
      {demos.map((demo, index) => {
        const isSelected = demo.id === selectedDemoId
        const accent = navItemClassNames[demo.accent]
        const startsWebmcpGroup =
          demo.track === 'webmcp' && demos[index - 1]?.track !== 'webmcp'

        return (
          <Fragment key={demo.id}>
            {startsWebmcpGroup ? <NavGroupLabel label="WebMCP" /> : null}
            <button
              aria-controls="demo-panel"
              // The WebMCP tabs are not numbered, so their accessible name has
              // to name the track that the group divider shows visually.
              aria-label={
                demo.track === 'webmcp'
                  ? `WebMCP track: ${demo.label}`
                  : undefined
              }
              aria-selected={isSelected}
              className={
                isSelected
                  ? `flex w-full items-center rounded-lg border px-3 py-2 text-left text-sm font-bold shadow-sm ${accent.active}`
                  : `${accent.hover} flex w-full items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700`
              }
              id={`demo-tab-${demo.id}`}
              onClick={() => onSelectDemo(demo.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              ref={registerTab(index)}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              type="button"
            >
              <span
                aria-hidden="true"
                className="mr-2 inline-block size-2 shrink-0 rounded-full bg-current"
              />
              {demo.track === 'webmcp' ? (
                demo.label
              ) : (
                <>
                  {index + 1}. {demo.label}
                </>
              )}
            </button>
          </Fragment>
        )
      })}
      <NavGroupLabel label="Learn" />
      <a
        className="flex w-full items-center rounded-lg border border-brand-blue/30 bg-white px-3 py-2 text-left text-sm font-bold text-brand-blue hover:bg-brand-blue/5"
        href={documentationHash('overview')}
        onClick={onOpenDocumentation}
      >
        <span aria-hidden="true" className="mr-2">
          ◫
        </span>
        Documentation
      </a>
    </div>
  )
}
