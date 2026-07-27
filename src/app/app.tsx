import { useState } from 'react'

import { documentationNavGroups } from '../docs/documentation-content'
import { DocumentationPage } from '../docs/documentation-page'
import { isDemoVisible, visibleDemos } from './demo-registry'
import { revealChromeByDefault } from './feature-flags'
import { useDemoTabList } from './hooks/use-demo-tab-list'
import { useHashRoute } from './hooks/use-hash-route'
import { useRouteFocus } from './hooks/use-route-focus'
import { DocumentationSidebar } from './layout/documentation-sidebar'
import { MobileNavToggle } from './layout/mobile-nav-toggle'
import { PlaygroundHeader } from './layout/playground-header'
import { PlaygroundSidebar } from './layout/playground-sidebar'
import type { DemoId } from './navigation'
import { RevealContext } from './reveal-context'

function documentationLabel(sectionId: string) {
  return (
    documentationNavGroups
      .flatMap((group) => group.items)
      .find((item) => item.id === sectionId)?.label ?? 'Overview'
  )
}

export function App() {
  const { route, navigateToDemo } = useHashRoute()
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false)

  function openDemo(demoId: DemoId) {
    setIsMobileNavigationOpen(false)
    navigateToDemo(demoId)
  }

  const { registerTab, handleTabKeyDown, focusDemoTab } = useDemoTabList(
    visibleDemos,
    openDemo,
  )

  // The playground panel is always mounted from a real demo, so leaving the
  // documentation returns focus to the tab that will be showing.
  const selectedDemoId =
    route.surface === 'playground' ? route.demoId : visibleDemos[0].id
  const mainRef = useRouteFocus(route, () => focusDemoTab(selectedDemoId))

  const selectedDemo =
    visibleDemos.find((demo) => demo.id === selectedDemoId) ?? visibleDemos[0]
  const SelectedDemo = selectedDemo.component
  const isDocs = route.surface === 'docs'

  return (
    <RevealContext value={revealChromeByDefault}>
      <div className="flex h-screen flex-col overflow-hidden bg-brand-yellow/10 text-slate-950">
        <div
          aria-hidden="true"
          className="h-2 shrink-0 bg-[linear-gradient(to_right,var(--color-brand-yellow)_0_25%,var(--color-brand-red)_25%_50%,var(--color-brand-green)_50%_75%,var(--color-brand-blue)_75%_100%)]"
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <nav
            aria-label={isDocs ? 'Documentation' : 'Playground'}
            className={`bg-brand-white/95 flex w-full flex-col border-b border-brand-blue/15 shadow-sm md:min-h-0 md:w-64 md:shrink-0 md:border-r md:border-b-0 ${
              isMobileNavigationOpen ? 'min-h-0 flex-1' : 'shrink-0'
            }`}
          >
            <MobileNavToggle
              isOpen={isMobileNavigationOpen}
              onToggle={() => setIsMobileNavigationOpen((isOpen) => !isOpen)}
              selectionLabel={
                isDocs
                  ? documentationLabel(route.sectionId)
                  : selectedDemo.label
              }
              surfaceLabel={isDocs ? 'Documentation' : 'Playground'}
            />

            <div
              className={`min-h-0 flex-1 overflow-y-auto md:block ${
                isMobileNavigationOpen ? 'block' : 'hidden'
              }`}
              id="primary-navigation-items"
            >
              {isDocs ? (
                <DocumentationSidebar
                  onNavigate={() => setIsMobileNavigationOpen(false)}
                  selectedSectionId={route.sectionId}
                />
              ) : (
                <PlaygroundSidebar
                  demos={visibleDemos}
                  onOpenDocumentation={() => setIsMobileNavigationOpen(false)}
                  onSelectDemo={openDemo}
                  onTabKeyDown={handleTabKeyDown}
                  registerTab={registerTab}
                  selectedDemoId={selectedDemoId}
                />
              )}
            </div>
          </nav>

          <main
            aria-label={
              isDocs ? 'Chrome AI documentation' : 'Chrome AI playground'
            }
            className={`min-h-0 flex-1 overflow-y-auto outline-none md:block ${
              isMobileNavigationOpen ? 'hidden' : 'block'
            }`}
            ref={mainRef}
            tabIndex={-1}
          >
            {!isDocs && revealChromeByDefault ? <PlaygroundHeader /> : null}

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
              {isDocs ? (
                <DocumentationPage
                  isDemoAvailable={isDemoVisible}
                  onOpenDemo={openDemo}
                  sectionId={route.sectionId}
                />
              ) : (
                <div
                  aria-labelledby={`demo-tab-${selectedDemo.id}`}
                  id="demo-panel"
                  role="tabpanel"
                  tabIndex={0}
                >
                  <SelectedDemo accent={selectedDemo.accent} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </RevealContext>
  )
}
